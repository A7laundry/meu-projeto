import { notFound } from 'next/navigation'
import { getOrder } from '@/actions/orders/list'
import { OrderQRLabel } from '@/components/domain/order/order-qr-label'
import { LabelPrintButton } from './label-print-button'

export default async function OrderLabelPage({
  params,
}: {
  params: Promise<{ unitId: string; orderId: string }>
}) {
  const { orderId } = await params
  const order = await getOrder(orderId)

  if (!order) notFound()

  return (
    <>
      {/* CSS de impressão */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #label-print, #label-print * { visibility: visible; }
          #label-print {
            position: absolute;
            top: 0;
            left: 0;
            width: 80mm;
            border: none;
            border-radius: 0;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Área de tela (não impressa) */}
      <div className="no-print flex items-center justify-between p-4 border-b bg-white">
        <h1 className="text-sm font-medium text-gray-600">Etiqueta — {order.order_number}</h1>
        <LabelPrintButton />
      </div>

      {/* Preview da etiqueta */}
      <div className="flex items-center justify-center p-8 bg-gray-100 min-h-screen">
        <OrderQRLabel order={order} />
      </div>
    </>
  )
}
