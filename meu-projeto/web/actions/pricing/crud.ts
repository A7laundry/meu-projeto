'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import type { PriceTableEntry } from '@/types/pricing'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const priceSchema = z.object({
  piece_type: z.string().min(1),
  price: z.coerce.number().min(0, 'Preço deve ser maior ou igual a zero'),
  unit_label: z.enum(['peça', 'kg', 'par']),
})

export async function listPriceTable(unitId: string): Promise<PriceTableEntry[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('price_table')
    .select('*')
    .eq('unit_id', unitId)
    .order('piece_type')

  return (data ?? []) as PriceTableEntry[]
}

export async function upsertPrice(
  unitId: string,
  formData: FormData,
): Promise<ActionResult<PriceTableEntry>> {
  const raw = {
    piece_type: formData.get('piece_type') as string,
    price: formData.get('price') as string,
    unit_label: formData.get('unit_label') as string,
  }

  const parsed = priceSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('price_table')
    .upsert(
      { ...parsed.data, unit_id: unitId },
      { onConflict: 'unit_id,piece_type' },
    )
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/pricing`)
  return { success: true, data: data as PriceTableEntry }
}

export async function getEffectivePrice(
  unitId: string,
  clientId: string,
  pieceType: string,
): Promise<number | null> {
  const supabase = createAdminClient()

  // Verifica preço especial do cliente
  const { data: clientPrice } = await supabase
    .from('client_prices')
    .select('price')
    .eq('client_id', clientId)
    .eq('piece_type', pieceType)
    .eq('active', true)
    .single()

  if (clientPrice) return clientPrice.price

  // Fallback: preço base
  const { data: basePrice } = await supabase
    .from('price_table')
    .select('price')
    .eq('unit_id', unitId)
    .eq('piece_type', pieceType)
    .eq('active', true)
    .single()

  return basePrice?.price ?? null
}
