import type { OrderStatus } from '@/types/order'

// ---------------------------------------------------------------------------
// State machine de transições válidas para OrderStatus
// ---------------------------------------------------------------------------

/**
 * Mapa de transições válidas.
 *
 * Cada chave é um status de origem e o valor é a lista de status de destino
 * permitidos. O fluxo padrão de uma comanda (order) na lavanderia é:
 *
 *   received -> sorting -> washing -> drying -> ironing -> ready -> shipped -> delivered
 *
 * `delivered` é um estado terminal (sem transições de saída).
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  received: ['sorting'],
  sorting: ['washing'],
  washing: ['drying'],
  drying: ['ironing'],
  ironing: ['ready'],
  ready: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
}

/**
 * Verifica se a transição de `from` para `to` é válida.
 *
 * @returns `true` se a transição é permitida, `false` caso contrário.
 */
export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  const allowed = ORDER_TRANSITIONS[from]
  return allowed !== undefined && allowed.includes(to)
}

/**
 * Valida a transição e lanca erro descritivo se inválida.
 *
 * @throws Error com mensagem explicando o status atual, o destino
 *         solicitado e os destinos permitidos.
 */
export function validateTransition(
  from: OrderStatus,
  to: OrderStatus,
): void {
  if (!canTransition(from, to)) {
    const allowed = ORDER_TRANSITIONS[from]
    const allowedStr =
      allowed && allowed.length > 0
        ? allowed.join(', ')
        : 'nenhum (estado terminal)'

    throw new Error(
      `Transição inválida: "${from}" -> "${to}". ` +
        `Transições permitidas a partir de "${from}": ${allowedStr}`,
    )
  }
}
