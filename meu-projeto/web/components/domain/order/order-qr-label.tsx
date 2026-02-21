'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'react-qr-code'
import JsBarcode from 'jsbarcode'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Order, PieceType } from '@/types/order'

const PIECE_LABEL: Record<PieceType, string> = {
  clothing: 'Roupa',
  costume: 'Fantasia',
  sneaker: 'Tênis',
  rug: 'Tapete',
  curtain: 'Cortina',
  industrial: 'Industrial',
  other: 'Outro',
}

interface OrderQRLabelProps {
  order: Order
}

export function OrderQRLabel({ order }: OrderQRLabelProps) {
  const barcodeRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, order.order_number, {
        format: 'CODE128',
        width: 2,
        height: 40,
        displayValue: false,
        margin: 0,
      })
    }
  }, [order.order_number])

  const totalPieces = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0
  const piecesSummary = order.items
    ?.map((i) => `${i.quantity}× ${i.piece_type === 'other' ? (i.piece_type_label ?? 'Outro') : PIECE_LABEL[i.piece_type]}`)
    .join(', ') ?? ''

  return (
    <div id="label-print" className="label-container font-mono text-black bg-white border border-gray-300 rounded-lg p-4 w-80">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">A7x OS</span>
        <span className="text-lg font-bold">{order.order_number}</span>
      </div>

      {/* QR Code + info */}
      <div className="flex gap-3 mb-3">
        <div className="flex-shrink-0">
          <QRCode value={order.id} size={100} level="M" />
        </div>
        <div className="flex-1 text-xs space-y-1 overflow-hidden">
          <div>
            <span className="text-gray-400 uppercase tracking-wide">Cliente</span>
            <p className="font-semibold truncate">{order.client_name}</p>
          </div>
          <div>
            <span className="text-gray-400 uppercase tracking-wide">Promessa</span>
            <p className="font-semibold">
              {format(new Date(order.promised_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
            </p>
          </div>
          <div>
            <span className="text-gray-400 uppercase tracking-wide">Total</span>
            <p className="font-semibold">{totalPieces} peças</p>
          </div>
        </div>
      </div>

      {/* Resumo de itens */}
      <div className="text-xs text-gray-600 border-t border-gray-100 pt-2 mb-3">
        <p className="leading-relaxed">{piecesSummary}</p>
      </div>

      {/* Código de barras Code128 */}
      <div className="flex justify-center">
        <svg ref={barcodeRef} />
      </div>
      <p className="text-center text-xs text-gray-400 mt-1">{order.order_number}</p>
    </div>
  )
}
