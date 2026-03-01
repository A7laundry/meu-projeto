'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireUnitAccess } from '@/lib/auth/guards'

export interface ConsumptionRow {
  productName: string
  totalQuantity: number
  unitCost: number
  totalCost: number
  movementCount: number
}

export interface ConsumptionReport {
  period: string
  totalCost: number
  totalMovements: number
  costPerKg: number
  costPerWash: number
  byProduct: ConsumptionRow[]
}

export async function getConsumptionReport(
  unitId: string,
  days: number = 30
): Promise<ConsumptionReport> {
  await requireUnitAccess(unitId, ['unit_manager', 'director'])

  const supabase = createAdminClient()
  const since = new Date(Date.now() - days * 86400_000).toISOString()

  // Buscar movimentações de saída + dados de produto e lavagens do período
  const [movementsRes, washingsRes] = await Promise.all([
    supabase
      .from('chemical_movements')
      .select('quantity, product_id, product:chemical_products(name, unit_cost)')
      .eq('unit_id', unitId)
      .eq('movement_type', 'out')
      .gte('created_at', since),
    supabase
      .from('washing_records')
      .select('weight_kg')
      .eq('unit_id', unitId)
      .gte('created_at', since),
  ])

  const movements = movementsRes.data ?? []
  const washings = washingsRes.data ?? []

  // Agregar por produto
  const productMap = new Map<string, {
    name: string
    totalQty: number
    unitCost: number
    count: number
  }>()

  for (const m of movements) {
    const product = m.product as unknown as { name: string; unit_cost: number } | null
    const productId = m.product_id as string
    const entry = productMap.get(productId) ?? {
      name: product?.name ?? 'Produto',
      totalQty: 0,
      unitCost: Number(product?.unit_cost ?? 0),
      count: 0,
    }
    entry.totalQty += Number(m.quantity)
    entry.count += 1
    productMap.set(productId, entry)
  }

  const byProduct: ConsumptionRow[] = Array.from(productMap.values())
    .map((p) => ({
      productName: p.name,
      totalQuantity: Math.round(p.totalQty * 100) / 100,
      unitCost: p.unitCost,
      totalCost: Math.round(p.totalQty * p.unitCost * 100) / 100,
      movementCount: p.count,
    }))
    .sort((a, b) => b.totalCost - a.totalCost)

  const totalCost = byProduct.reduce((s, p) => s + p.totalCost, 0)
  const totalKg = washings.reduce((s, w) => s + Number(w.weight_kg ?? 0), 0)
  const totalWashes = washings.length

  return {
    period: `Últimos ${days} dias`,
    totalCost: Math.round(totalCost * 100) / 100,
    totalMovements: movements.length,
    costPerKg: totalKg > 0 ? Math.round((totalCost / totalKg) * 100) / 100 : 0,
    costPerWash: totalWashes > 0 ? Math.round((totalCost / totalWashes) * 100) / 100 : 0,
    byProduct,
  }
}
