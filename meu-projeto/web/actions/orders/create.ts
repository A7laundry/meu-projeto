'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole, requireUnitAccess } from '@/lib/auth/guards'
import { validateTransition } from '@/lib/auth/order-machine'
import { z } from 'zod'
import type { ActionResult } from '@/lib/auth/action-result'
import type { OrderStatus } from '@/types/order'

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
  payment_method: z.enum(['cash', 'credit_card', 'debit_card', 'pix']).optional().nullable(),
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
  const supabase = createAdminClient()
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
  try {
    const { user } = await requireRole(['operator', 'unit_manager', 'store'])

    const parsed = createOrderSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const admin = createAdminClient()

    const orderNumber = await generateOrderNumber(unitId, unitSlug)

    // Se payment_method foi informado, salvar no campo da tabela (migration 026)
    const paymentMethod = parsed.data.payment_method ?? null
    const paymentLabel: Record<string, string> = {
      cash: 'Dinheiro',
      credit_card: 'Cartao Credito',
      debit_card: 'Cartao Debito',
      pix: 'PIX',
    }
    const notesWithPayment = paymentMethod
      ? [parsed.data.notes, `Pagamento: ${paymentLabel[paymentMethod] ?? paymentMethod}`].filter(Boolean).join(' | ')
      : (parsed.data.notes ?? null)

    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        unit_id: unitId,
        client_id: parsed.data.client_id ?? null,
        client_name: parsed.data.client_name,
        order_number: orderNumber,
        status: 'received',
        promised_at: parsed.data.promised_at,
        notes: notesWithPayment,
        payment_method: paymentMethod,
        created_by: user.id,
      })
      .select('id, order_number')
      .single()

    if (orderError || !order) {
      return { success: false, error: `Erro ao criar comanda: ${orderError?.message}` }
    }

    // Resolve unit_price for each item (historical price snapshot)
    const itemsToInsert = await Promise.all(
      parsed.data.items.map(async (item) => {
        let unitPrice: number | null = null

        // 1. Check client-specific price (if client is linked)
        if (parsed.data.client_id) {
          const { data: clientPrice } = await admin
            .from('client_prices')
            .select('price')
            .eq('client_id', parsed.data.client_id)
            .eq('piece_type', item.piece_type)
            .eq('active', true)
            .maybeSingle()

          if (clientPrice) {
            unitPrice = Number(clientPrice.price)
          }
        }

        // 2. Fallback to standard price table
        if (unitPrice === null) {
          const { data: standardPrice } = await admin
            .from('price_table')
            .select('price')
            .eq('unit_id', unitId)
            .eq('piece_type', item.piece_type)
            .eq('active', true)
            .maybeSingle()

          if (standardPrice) {
            unitPrice = Number(standardPrice.price)
          }
        }

        return {
          order_id: order.id,
          piece_type: item.piece_type,
          piece_type_label: item.piece_type_label ?? null,
          quantity: item.quantity,
          unit_price: unitPrice,
          recipe_id: item.recipe_id ?? null,
          notes: item.notes ?? null,
        }
      })
    )

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
      operator_id: user.id,
      notes: 'Comanda criada — peças recebidas',
    })

    revalidatePath(`/unit/${unitId}/production/orders`)
    return { success: true, data: { orderId: order.id, orderNumber: order.order_number } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

export async function updateOrderStatus(
  orderId: string,
  unitId: string,
  status: string,
  sector: string,
  eventType: 'entry' | 'exit' | 'alert' = 'entry',
  notes?: string
): Promise<ActionResult> {
  try {
    const { user } = await requireUnitAccess(unitId, ['operator', 'unit_manager'])

    const admin = createAdminClient()

    // Buscar status atual para validar transição
    const { data: currentOrder } = await admin
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .eq('unit_id', unitId)
      .single()

    if (currentOrder) {
      validateTransition(currentOrder.status as OrderStatus, status as OrderStatus)
    }

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
      operator_id: user.id,
      notes: notes ?? null,
    })

    revalidatePath(`/unit/${unitId}/production/orders`)
    revalidatePath(`/unit/${unitId}/production/orders/${orderId}`)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

// ──────────────────────────────────────────────────────────────
// Clientes (busca para autocomplete)
// ──────────────────────────────────────────────────────────────

export async function searchClients(unitId: string, query: string) {
  await requireUnitAccess(unitId, ['operator', 'unit_manager', 'store'])

  const supabase = createAdminClient()
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
    notes?: string
  }
): Promise<ActionResult> {
  try {
    const { user } = await requireUnitAccess(unitId, ['operator', 'unit_manager'])

    const admin = createAdminClient()
    const { error } = await admin.from('order_events').insert({
      order_id: orderId,
      unit_id: unitId,
      sector: event.sector,
      event_type: event.event_type,
      operator_id: user.id,
      notes: event.notes ?? null,
    })

    if (error) return { success: false, error: `Erro ao registrar evento: ${error.message}` }

    revalidatePath(`/unit/${unitId}/alerts`)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}
