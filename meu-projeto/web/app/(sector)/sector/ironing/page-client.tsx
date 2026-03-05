'use client'

import { useState } from 'react'
import { SectorQueue } from '@/components/domain/production/sector-queue'
import { GenericSectorForm } from '@/components/domain/production/generic-sector-form'
import type { SectorKpi } from '@/actions/production/sector-kpis'
import type { Order, OrderStatus } from '@/types/order'
import type { Equipment } from '@/types/equipment'
import type { ShiftCycleCount } from '@/actions/equipment/shift-cycles'

interface SectorPageClientProps {
  unitId: string
  operatorName: string
  sectorKey: 'washing' | 'drying' | 'ironing' | 'shipping'
  sectorName: string
  statuses: OrderStatus[]
  equipment?: Equipment[]
  shiftCycles?: ShiftCycleCount[]
  sectorKpis?: SectorKpi
}

export function SectorPageClient({
  unitId,
  operatorName,
  sectorKey,
  sectorName,
  statuses,
  equipment,
  shiftCycles,
  sectorKpis,
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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg">
          ✓ Concluído com sucesso!
        </div>
      )}
      {selectedOrder ? (
        <GenericSectorForm
          order={selectedOrder}
          unitId={unitId}
          sectorKey={sectorKey}
          equipment={equipment}
          shiftCycles={shiftCycles}
          sectorKpis={sectorKpis}
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
