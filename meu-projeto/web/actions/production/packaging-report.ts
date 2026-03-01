'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireUnitAccess } from '@/lib/auth/guards'

export interface PackagingRow {
  packaging_type: string
  total_quantity: number
  order_count: number
}

export async function getPackagingReport(
  unitId: string,
  days: number = 30
): Promise<PackagingRow[]> {
  await requireUnitAccess(unitId, ['unit_manager', 'director'])

  const supabase = createAdminClient()
  const since = new Date(Date.now() - days * 86400_000).toISOString()

  const { data } = await supabase
    .from('shipping_records')
    .select('packaging_type, packaging_quantity')
    .eq('unit_id', unitId)
    .gte('created_at', since)

  if (!data || data.length === 0) return []

  const map = new Map<string, { total: number; count: number }>()
  for (const row of data) {
    const type = row.packaging_type ?? 'bag'
    const entry = map.get(type) ?? { total: 0, count: 0 }
    entry.total += row.packaging_quantity ?? 1
    entry.count += 1
    map.set(type, entry)
  }

  return Array.from(map.entries())
    .map(([type, { total, count }]) => ({
      packaging_type: type,
      total_quantity: total,
      order_count: count,
    }))
    .sort((a, b) => b.total_quantity - a.total_quantity)
}
