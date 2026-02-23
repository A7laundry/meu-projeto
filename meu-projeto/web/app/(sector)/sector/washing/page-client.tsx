'use client'

import { useState } from 'react'
import { SectorQueue } from '@/components/domain/production/sector-queue'
import { WashingForm } from '@/components/domain/production/washing-form'
import type { Order } from '@/types/order'
import type { Equipment } from '@/types/equipment'
import type { Recipe } from '@/types/recipe'
import type { WashingKpis } from '@/actions/production/washing-kpis'

interface WashingPageClientProps {
  unitId: string
  operatorId: string
  operatorName: string
  equipment: Equipment[]
  recipes: Recipe[]
  kpis: WashingKpis
}

export function WashingPageClient({
  unitId,
  operatorId,
  operatorName,
  equipment,
  recipes,
  kpis,
}: WashingPageClientProps) {
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
        <WashingForm
          order={selectedOrder}
          unitId={unitId}
          operatorId={operatorId}
          equipment={equipment}
          recipes={recipes}
          kpis={kpis}
          onComplete={handleComplete}
          onCancel={() => setSelectedOrder(null)}
        />
      ) : (
        <SectorQueue
          unitId={unitId}
          sectorName="Lavagem"
          operatorName={operatorName}
          statuses={['washing']}
          onSelectOrder={setSelectedOrder}
        />
      )}
    </div>
  )
}
