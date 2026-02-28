'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/guards'
import { validateTransition } from '@/lib/auth/order-machine'
import { z } from 'zod'
import type { ActionResult } from '@/lib/auth/action-result'
import type { OrderStatus } from '@/types/order'

// Mapa de transições de status por setor (defesa em profundidade — RPC também valida)
const SECTOR_TRANSITIONS: Record<string, { nextStatus: OrderStatus }> = {
  washing:  { nextStatus: 'drying' },
  drying:   { nextStatus: 'ironing' },
  ironing:  { nextStatus: 'ready' },
  shipping: { nextStatus: 'shipped' },
}

const sectorCompletionSchema = z.object({
  sectorKey: z.enum(['washing', 'drying', 'ironing', 'shipping'], {
    message: 'Setor inválido',
  }),
  orderId: z.string().uuid('ID da comanda inválido'),
  unitId: z.string().uuid('ID da unidade inválido'),
  equipmentId: z.string().uuid('ID do equipamento inválido').optional(),
  notes: z.string().optional(),
  // Washing-specific
  cycles: z.number().int().min(1).optional(),
  weightKg: z.number().positive().optional(),
  recipeId: z.string().uuid().optional(),
  startedAt: z.string().optional(),
  // Drying-specific
  temperatureLevel: z.enum(['low', 'medium', 'high']).optional(),
  // Ironing-specific
  piecesByType: z.array(z.object({
    piece_type: z.string().min(1),
    quantity: z.number().int().min(1),
  })).optional(),
  // Shipping-specific
  packagingType: z.enum(['bag', 'box', 'hanger', 'other']).optional(),
  packagingQuantity: z.number().int().min(1).optional(),
})

export type SectorCompletionData = z.infer<typeof sectorCompletionSchema>

/**
 * Monta o JSONB p_sector_data com os campos específicos de cada setor.
 * Para washing, inclui chemical_usage pré-computado a partir da receita.
 */
async function buildSectorData(
  data: SectorCompletionData,
  admin: ReturnType<typeof createAdminClient>
): Promise<Record<string, unknown>> {
  switch (data.sectorKey) {
    case 'washing': {
      // Calcular chemical_usage a partir da receita selecionada
      let chemicalUsage: Array<{ product_name: string; quantity_used: number }> = []
      if (data.recipeId && data.cycles) {
        const { data: chemicals } = await admin
          .from('recipe_chemicals')
          .select('quantity_per_cycle, chemical_products(name)')
          .eq('recipe_id', data.recipeId)

        if (chemicals && chemicals.length > 0) {
          chemicalUsage = chemicals.map((c) => ({
            product_name: (c.chemical_products as unknown as { name: string } | null)?.name ?? 'Produto',
            quantity_used: ((c.quantity_per_cycle as number) ?? 0) * (data.cycles ?? 1),
          }))
        }
      }

      return {
        cycles: data.cycles ?? 1,
        weight_kg: data.weightKg ?? null,
        started_at: data.startedAt ?? null,
        chemical_usage: chemicalUsage,
      }
    }
    case 'drying':
      return {
        temperature_level: data.temperatureLevel ?? 'medium',
      }
    case 'ironing':
      return {
        pieces_by_type: data.piecesByType ?? [],
      }
    case 'shipping':
      return {
        packaging_type: data.packagingType ?? 'bag',
        packaging_quantity: data.packagingQuantity ?? 1,
      }
    default:
      return {}
  }
}

export async function completeSector(rawData: SectorCompletionData): Promise<ActionResult> {
  try {
    const { user } = await requireRole(['operator', 'unit_manager'])

    const parsed = sectorCompletionSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const data = parsed.data

    const transition = SECTOR_TRANSITIONS[data.sectorKey]
    if (!transition) {
      return { success: false, error: 'Setor inválido.' }
    }

    const admin = createAdminClient()

    // Defesa em profundidade: validar transição no app antes da RPC
    const { data: currentOrder, error: fetchError } = await admin
      .from('orders')
      .select('status')
      .eq('id', data.orderId)
      .eq('unit_id', data.unitId)
      .single()

    if (fetchError || !currentOrder) {
      return { success: false, error: 'Comanda não encontrada.' }
    }

    validateTransition(currentOrder.status as OrderStatus, transition.nextStatus)

    // Montar sector_data JSONB com campos específicos do setor
    const sectorData = await buildSectorData(data, admin)

    // Chamada RPC atômica — substitui todas as queries individuais
    // (update order + insert event + insert sector record + equipment log)
    const { data: rpcResult, error: rpcError } = await admin.rpc('complete_sector', {
      p_order_id: data.orderId,
      p_unit_id: data.unitId,
      p_sector: data.sectorKey,
      p_operator_id: user.id,
      p_equipment_id: data.equipmentId || null,
      p_notes: data.notes || null,
      p_sector_data: sectorData,
    })

    if (rpcError) {
      return { success: false, error: `Erro na transição de setor: ${rpcError.message}` }
    }

    // A RPC retorna JSONB com { success, error?, event_id?, new_status?, ... }
    const result = rpcResult as {
      success: boolean
      error?: string
      event_id?: string
      new_status?: string
      previous_status?: string
      sector?: string
    }

    if (!result.success) {
      return { success: false, error: result.error ?? 'Erro desconhecido na RPC.' }
    }

    revalidatePath(`/sector/${data.sectorKey}`)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}
