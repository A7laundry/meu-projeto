'use client'

import { useState, useTransition } from 'react'
import { SectorQueue } from '@/components/domain/production/sector-queue'
import { GenericSectorForm, type ManifestOption } from '@/components/domain/production/generic-sector-form'
import { notifyClientOrderReady } from '@/actions/orders/notify-client'
import type { Order, OrderStatus } from '@/types/order'

interface SectorPageClientProps {
  unitId: string
  operatorName: string
  sectorKey: 'washing' | 'drying' | 'ironing' | 'shipping'
  sectorName: string
  statuses: OrderStatus[]
  manifests?: ManifestOption[]
}

interface NotifyState {
  orderNumber: string
  clientName: string
  whatsappUrl: string | null
  phone: string | null
}

export function SectorPageClient({
  unitId,
  operatorName,
  sectorKey,
  sectorName,
  statuses,
  manifests,
}: SectorPageClientProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [notifyState, setNotifyState] = useState<NotifyState | null>(null)
  const [isNotifying, startNotifyTransition] = useTransition()

  function handleComplete() {
    if (sectorKey === 'shipping' && selectedOrder) {
      // For shipping sector, show notification dialog instead of closing immediately
      startNotifyTransition(async () => {
        const result = await notifyClientOrderReady(selectedOrder.id, unitId)
        if (result.success) {
          setNotifyState({
            orderNumber: selectedOrder.order_number,
            clientName: result.data.clientName,
            whatsappUrl: result.data.whatsappUrl,
            phone: result.data.phone,
          })
        } else {
          // If notification fails, still show success and close
          setNotifyState({
            orderNumber: selectedOrder.order_number,
            clientName: selectedOrder.client_name,
            whatsappUrl: null,
            phone: null,
          })
        }
        setSelectedOrder(null)
      })
    } else {
      setSelectedOrder(null)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
  }

  function handleCloseNotify() {
    setNotifyState(null)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {showSuccess && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg">
          ✓ Conclu\u00eddo com sucesso!
        </div>
      )}

      {/* Notification dialog overlay */}
      {notifyState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, rgba(52,211,153,0.08) 0%, rgba(5,5,8,0.98) 100%)',
              border: '1px solid rgba(52,211,153,0.22)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.60)',
            }}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 text-center">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{
                  fontSize: 32,
                  background: 'rgba(52,211,153,0.12)',
                  border: '1px solid rgba(52,211,153,0.25)',
                }}
              >
                ✅
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Comanda #{notifyState.orderNumber} pronta!
              </h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {notifyState.clientName}
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 space-y-3">
              {notifyState.whatsappUrl ? (
                <a
                  href={notifyState.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCloseNotify}
                  className="flex items-center justify-center gap-2.5 w-full h-14 rounded-xl font-bold text-base transition-all active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #25d366 0%, #128c48 100%)',
                    color: 'white',
                    border: '1px solid rgba(37,211,102,0.40)',
                    boxShadow: '0 4px 20px rgba(37,211,102,0.30)',
                    textDecoration: 'none',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Notificar via WhatsApp
                </a>
              ) : (
                <div
                  className="flex items-center gap-3 w-full rounded-xl px-4 py-3.5"
                  style={{
                    background: 'rgba(251,191,36,0.08)',
                    border: '1px solid rgba(251,191,36,0.20)',
                  }}
                >
                  <span style={{ fontSize: 20 }}>📵</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#fbbf24' }}>
                      Cliente sem telefone
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.30)' }}>
                      Cadastre o telefone para notificar.
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleCloseNotify}
                className="w-full h-12 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.55)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay while fetching notification data */}
      {isNotifying && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(4px)' }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="h-10 w-10 animate-spin rounded-full border-3 border-t-transparent"
              style={{ borderColor: 'rgba(52,211,153,0.40)', borderTopColor: 'transparent' }}
            />
            <p className="text-sm text-white/50">Preparando notifica\u00e7\u00e3o...</p>
          </div>
        </div>
      )}

      {selectedOrder ? (
        <GenericSectorForm
          order={selectedOrder}
          unitId={unitId}
          sectorKey={sectorKey}
          manifests={manifests}
          onComplete={handleComplete}
          onCancel={() => setSelectedOrder(null)}
        />
      ) : (
        <SectorQueue
          unitId={unitId}
          sectorName={sectorName}
          operatorName={operatorName}
          statuses={statuses}
          onSelectOrder={setSelectedOrder}
        />
      )}
    </div>
  )
}
