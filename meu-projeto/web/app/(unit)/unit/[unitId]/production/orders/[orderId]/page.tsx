import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrder } from '@/actions/orders/list'
import { OrderTimeline } from '@/components/domain/order/order-timeline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { OrderStatus, PieceType } from '@/types/order'

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

const PIECE_LABEL: Record<PieceType, string> = {
  clothing: 'Roupa comum',
  costume: 'Fantasia',
  sneaker: 'Tênis',
  rug: 'Tapete',
  curtain: 'Cortina',
  industrial: 'Industrial',
  other: 'Outro',
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ unitId: string; orderId: string }>
}) {
  const { unitId, orderId } = await params
  const order = await getOrder(orderId)

  if (!order) notFound()

  const totalPieces = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold font-mono text-gray-900">{order.order_number}</h1>
            <Badge>{STATUS_LABEL[order.status]}</Badge>
          </div>
          <p className="text-gray-600">{order.client_name}</p>
          <p className="text-sm text-gray-400 mt-0.5">
            Promessa: {format(new Date(order.promised_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/unit/${unitId}/production/orders/${orderId}/label`}>
              🏷️ Imprimir Etiqueta
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/unit/${unitId}/production/orders`}>← Voltar</Link>
          </Button>
        </div>
      </div>

      {/* Observações */}
      {order.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800 font-medium">Observação</p>
          <p className="text-sm text-amber-700 mt-0.5">{order.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Itens */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Itens — {totalPieces} peças no total
          </h2>
          <div className="space-y-2">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border border-gray-100 bg-white px-3 py-2 text-sm">
                <span className="text-gray-800">
                  {item.piece_type === 'other' ? (item.piece_type_label ?? 'Outro') : PIECE_LABEL[item.piece_type]}
                </span>
                <div className="flex items-center gap-4">
                  {item.notes && (
                    <span className="text-xs text-gray-400">{item.notes}</span>
                  )}
                  <span className="font-semibold text-gray-900">{item.quantity}×</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Histórico de eventos
          </h2>
          <OrderTimeline events={order.events ?? []} />
        </section>
      </div>
    </div>
  )
}
