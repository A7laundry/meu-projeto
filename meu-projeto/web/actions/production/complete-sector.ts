'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/actions/staff/invite'
import type { OrderStatus } from '@/types/order'

// Mapa de transições de status por setor
const SECTOR_TRANSITIONS: Record<string, { sector: string; nextStatus: OrderStatus }> = {
  washing:  { sector: 'washing',  nextStatus: 'drying' },
  drying:   { sector: 'drying',   nextStatus: 'ironing' },
  ironing:  { sector: 'ironing',  nextStatus: 'ready' },
  shipping: { sector: 'shipping', nextStatus: 'shipped' },
}

export interface SectorCompletionData {
  sectorKey: 'washing' | 'drying' | 'ironing' | 'shipping'
  orderId: string
  unitId: string
  equipmentId?: string
  notes?: string
  // Washing-specific
  cycles?: number
  weightKg?: number
  // Drying-specific
  temperatureLevel?: 'low' | 'medium' | 'high'
  // Ironing-specific
  piecesByType?: Array<{ piece_type: string; quantity: number }>
  // Shipping-specific
  packagingType?: 'bag' | 'box' | 'hanger' | 'other'
  packagingQuantity?: number
}

export async function completeSector(data: SectorCompletionData): Promise<ActionResult> {
  const admin = createAdminClient()
  const supabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  const transition = SECTOR_TRANSITIONS[data.sectorKey]
  if (!transition) {
    return { success: false, error: 'Setor inválido.' }
  }

  // Atualizar status da comanda
  const { error: orderError } = await admin
    .from('orders')
    .update({ status: transition.nextStatus })
    .eq('id', data.orderId)
    .eq('unit_id', data.unitId)

  if (orderError) {
    return { success: false, error: `Erro ao atualizar comanda: ${orderError.message}` }
  }

  // Registrar evento
  const { data: event, error: eventError } = await admin
    .from('order_events')
    .insert({
      order_id: data.orderId,
      unit_id: data.unitId,
      sector: transition.sector,
      event_type: 'exit',
      operator_id: user?.id ?? null,
      equipment_id: data.equipmentId ?? null,
      notes: data.notes ?? null,
    })
    .select('id')
    .single()

  if (eventError || !event) {
    return { success: false, error: `Erro ao registrar evento: ${eventError?.message}` }
  }

  // Inserir registro específico do setor
  const eventId = event.id

  if (data.sectorKey === 'washing') {
    await admin.from('washing_records').insert({
      order_event_id: eventId,
      equipment_id: data.equipmentId ?? null,
      cycles: data.cycles ?? 1,
      weight_kg: data.weightKg ?? null,
      started_at: null,
      finished_at: new Date().toISOString(),
    })
  } else if (data.sectorKey === 'drying') {
    await admin.from('drying_records').insert({
      order_event_id: eventId,
      equipment_id: data.equipmentId ?? null,
      temperature_level: data.temperatureLevel ?? 'medium',
      finished_at: new Date().toISOString(),
    })
  } else if (data.sectorKey === 'ironing') {
    await admin.from('ironing_records').insert({
      order_event_id: eventId,
      pieces_by_type: data.piecesByType ?? [],
      finished_at: new Date().toISOString(),
    })
  } else if (data.sectorKey === 'shipping') {
    await admin.from('shipping_records').insert({
      order_event_id: eventId,
      packaging_type: data.packagingType ?? 'bag',
      packaging_quantity: data.packagingQuantity ?? 1,
    })
  }

  revalidatePath(`/sector/${data.sectorKey}`)
  return { success: true, data: undefined }
}
