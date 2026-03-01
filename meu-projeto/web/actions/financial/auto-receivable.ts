'use server'

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Gera automaticamente um receivable quando uma comanda é entregue (delivered).
 * Calcula o valor total a partir da price_table da unidade.
 * Chamada internamente pelo complete-sector (shipping).
 */
export async function generateReceivableFromOrder(
  orderId: string,
  unitId: string
): Promise<void> {
  const supabase = createAdminClient()

  // Verificar se já existe receivable para esta comanda (idempotência via FK)
  const { data: existing } = await supabase
    .from('receivables')
    .select('id')
    .eq('order_id', orderId)
    .limit(1)

  if (existing && existing.length > 0) return

  // Buscar dados da comanda
  const [orderRes, pricesRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, client_id, client_name, items:order_items(piece_type, quantity)')
      .eq('id', orderId)
      .eq('unit_id', unitId)
      .single(),
    supabase
      .from('price_table')
      .select('piece_type, price')
      .eq('unit_id', unitId)
      .eq('active', true),
  ])

  if (!orderRes.data) return

  const order = orderRes.data
  const priceMap = new Map<string, number>()
  for (const p of pricesRes.data ?? []) {
    priceMap.set(p.piece_type, Number(p.price))
  }

  // Calcular valor total
  let total = 0
  for (const item of (order.items as { piece_type: string; quantity: number }[] | null) ?? []) {
    total += (priceMap.get(item.piece_type) ?? 0) * item.quantity
  }

  if (total <= 0) return

  // Gerar due_date: 7 dias após a entrega
  const dueDate = new Date(Date.now() + 7 * 86400_000).toISOString().split('T')[0]

  await supabase.from('receivables').insert({
    unit_id: unitId,
    order_id: orderId,
    client_id: order.client_id,
    description: `Comanda #${order.order_number}`,
    amount: total,
    due_date: dueDate,
    status: 'pending',
    notes: `Gerado automaticamente na expedição`,
  })
}
