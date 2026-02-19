'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import type { ActionResult } from '@/actions/staff/invite'

// ──────────────────────────────────────────────────────────────
// Schemas
// ──────────────────────────────────────────────────────────────

const orderItemSchema = z.object({
  piece_type: z.enum(['clothing', 'costume', 'sneaker', 'rug', 'curtain', 'industrial', 'other']),
  piece_type_label: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(1, 'Quantidade mínima é 1'),
  recipe_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
})

const createOrderSchema = z.object({
  client_name: z.string().min(2, 'Nome do cliente obrigatório'),
  client_id: z.string().uuid().optional().nullable(),
  promised_at: z.string().min(1, 'Data de promessa obrigatória'),
  notes: z.string().optional().nullable(),
  items: z.array(orderItemSchema).min(1, 'Adicione ao menos 1 item à comanda'),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

async function generateOrderNumber(
  unitId: string,
  unitSlug: string
): Promise<string> {
  const supabase = await createClient()
  const year = new Date().getFullYear()

  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('unit_id', unitId)
    .gte('created_at', `${year}-01-01`)

  const prefix = unitSlug.slice(0, 2).toUpperCase()
  return `${prefix}-${String((count ?? 0) + 1).padStart(3, '0')}/${year}`
}

// ──────────────────────────────────────────────────────────────
// Actions
// ──────────────────────────────────────────────────────────────

export async function createOrder(
  unitId: string,
  unitSlug: string,
  input: CreateOrderInput
): Promise<ActionResult<{ orderId: string; orderNumber: string }>> {
  const parsed = createOrderSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdminClient()

  const orderNumber = await generateOrderNumber(unitId, unitSlug)

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      unit_id: unitId,
      client_id: parsed.data.client_id ?? null,
      client_name: parsed.data.client_name,
      order_number: orderNumber,
      status: 'received',
      promised_at: parsed.data.promised_at,
      notes: parsed.data.notes ?? null,
      created_by: user?.id ?? null,
    })
    .select('id, order_number')
    .single()

  if (orderError || !order) {
    return { success: false, error: `Erro ao criar comanda: ${orderError?.message}` }
  }

  const itemsToInsert = parsed.data.items.map((item) => ({
    order_id: order.id,
    piece_type: item.piece_type,
    piece_type_label: item.piece_type_label ?? null,
    quantity: item.quantity,
    recipe_id: item.recipe_id ?? null,
    notes: item.notes ?? null,
  }))

  const { error: itemsError } = await admin.from('order_items').insert(itemsToInsert)

  if (itemsError) {
    await admin.from('orders').delete().eq('id', order.id)
    return { success: false, error: `Erro ao salvar itens: ${itemsError.message}` }
  }

  // Evento inicial: entrada na unidade
  await admin.from('order_events').insert({
    order_id: order.id,
    unit_id: unitId,
    sector: 'received',
    event_type: 'entry',
    operator_id: user?.id ?? null,
    notes: 'Comanda criada — peças recebidas',
  })

  revalidatePath(`/unit/${unitId}/production/orders`)
  return { success: true, data: { orderId: order.id, orderNumber: order.order_number } }
}

export async function updateOrderStatus(
  orderId: string,
  unitId: string,
  status: string,
  sector: string,
  eventType: 'entry' | 'exit' | 'alert' = 'entry',
  notes?: string
): Promise<ActionResult> {
  const admin = createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await admin
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .eq('unit_id', unitId)

  if (error) return { success: false, error: `Erro ao atualizar status: ${error.message}` }

  await admin.from('order_events').insert({
    order_id: orderId,
    unit_id: unitId,
    sector,
    event_type: eventType,
    operator_id: user?.id ?? null,
    notes: notes ?? null,
  })

  revalidatePath(`/unit/${unitId}/production/orders`)
  revalidatePath(`/unit/${unitId}/production/orders/${orderId}`)
  return { success: true, data: undefined }
}

// ──────────────────────────────────────────────────────────────
// Clientes (busca para autocomplete)
// ──────────────────────────────────────────────────────────────

export async function searchClients(unitId: string, query: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('clients')
    .select('id, name, document, phone')
    .eq('unit_id', unitId)
    .eq('active', true)
    .ilike('name', `%${query}%`)
    .limit(10)

  return data ?? []
}

// ──────────────────────────────────────────────────────────────
// Registrar evento avulso (sem alterar status)
// ──────────────────────────────────────────────────────────────

export async function createOrderEvent(
  orderId: string,
  unitId: string,
  event: {
    sector: string
    event_type: 'entry' | 'exit' | 'alert'
    operator_id: string | null
    notes?: string
  }
): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin.from('order_events').insert({
    order_id: orderId,
    unit_id: unitId,
    sector: event.sector,
    event_type: event.event_type,
    operator_id: event.operator_id,
    notes: event.notes ?? null,
  })

  if (error) return { success: false, error: `Erro ao registrar evento: ${error.message}` }

  revalidatePath(`/unit/${unitId}/alerts`)
  return { success: true, data: undefined }
}
