'use client'

import { useState } from 'react'
import { SectorQueue } from '@/components/domain/production/sector-queue'
import { GenericSectorForm } from '@/components/domain/production/generic-sector-form'
import type { Order, OrderStatus } from '@/types/order'

interface SectorPageClientProps {
  unitId: string
  operatorName: string
  sectorKey: 'washing' | 'drying' | 'ironing' | 'shipping'
  sectorName: string
  statuses: OrderStatus[]
}

export function SectorPageClient({
  unitId,
  operatorName,
  sectorKey,
  sectorName,
  statuses,
}: SectorPageClientProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  function handleComplete() {
    setSelectedOrder(null)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {showSuccess && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-sm font-bold shadow-lg slide-up"
          style={{
            background: 'rgba(52,211,153,0.18)',
            border: '1px solid rgba(52,211,153,0.40)',
            color: '#34d399',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 20px rgba(52,211,153,0.20)',
          }}
        >
          ✓ Concluído com sucesso!
        </div>
      )}
      {selectedOrder ? (
        <GenericSectorForm
          order={selectedOrder}
          unitId={unitId}
          sectorKey={sectorKey}
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
