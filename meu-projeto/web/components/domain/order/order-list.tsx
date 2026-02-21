'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Order, OrderStatus } from '@/types/order'

const STATUS_LABEL: Record<OrderStatus, string> = {
  received: 'Recebido',
  sorting: 'Triagem',
  washing: 'Lavagem',
  drying: 'Secagem',
  ironing: 'Passadoria',
  ready: 'Pronto',
  shipped: 'Enviado',
  delivered: 'Entregue',
}

const STATUS_VARIANT: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  received: 'secondary',
  sorting: 'secondary',
  washing: 'default',
  drying: 'default',
  ironing: 'default',
  ready: 'default',
  shipped: 'outline',
  delivered: 'outline',
}

interface OrderListProps {
  orders: Order[]
  unitId: string
}

export function OrderList({ orders, unitId }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-white/35">
        <p className="text-lg">Nenhuma comanda encontrada.</p>
        <p className="text-sm mt-1">Crie a primeira comanda para começar.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-white/08">
      <table className="w-full text-sm">
        <thead className="bg-[rgba(255,255,255,0.03)] text-left">
          <tr>
            <th className="px-4 py-3 font-medium text-white/55">Nº Comanda</th>
            <th className="px-4 py-3 font-medium text-white/55">Cliente</th>
            <th className="px-4 py-3 font-medium text-white/55">Status</th>
            <th className="px-4 py-3 font-medium text-white/55">Itens</th>
            <th className="px-4 py-3 font-medium text-white/55">Promessa</th>
            <th className="px-4 py-3 font-medium text-white/55">Criado em</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr
              key={order.id}
              className="hover:bg-[rgba(255,255,255,0.03)] transition-colors cursor-pointer"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/unit/${unitId}/production/orders/${order.id}`}
                  className="font-mono font-semibold text-[#60a5fa] hover:underline"
                >
                  {order.order_number}
                </Link>
              </td>
              <td className="px-4 py-3 text-white/90">{order.client_name}</td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[order.status]}>
                  {STATUS_LABEL[order.status]}
                </Badge>
              </td>
              <td className="px-4 py-3 text-white/55">
                {order.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0} peças
              </td>
              <td className="px-4 py-3 text-white/55">
                {format(new Date(order.promised_at), 'dd/MM/yyyy', { locale: ptBR })}
              </td>
              <td className="px-4 py-3 text-white/35">
                {format(new Date(order.created_at), 'dd/MM HH:mm', { locale: ptBR })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
