'use client'

import { useState } from 'react'
import { SectorQueue } from '@/components/domain/production/sector-queue'
import { SortingForm } from '@/components/domain/production/sorting-form'
import type { Order } from '@/types/order'
import type { Recipe } from '@/types/recipe'

interface SortingPageClientProps {
  unitId: string
  operatorName: string
  recipes: Recipe[]
}

export function SortingPageClient({ unitId, operatorName, recipes }: SortingPageClientProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [completedId, setCompletedId] = useState<string | null>(null)

  function handleComplete() {
    if (selectedOrder) setCompletedId(selectedOrder.id)
    setSelectedOrder(null)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Toast de sucesso */}
      {completedId && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg animate-fade-in"
          onAnimationEnd={() => setTimeout(() => setCompletedId(null), 2000)}
        >
          ✓ Triagem concluída com sucesso!
        </div>
      )}

      {selectedOrder ? (
        <SortingForm
          order={selectedOrder}
          unitId={unitId}
          recipes={recipes}
          onComplete={handleComplete}
          onCancel={() => setSelectedOrder(null)}
        />
      ) : (
        <SectorQueue
          unitId={unitId}
          sectorName="Triagem"
          operatorName={operatorName}
          statuses={['received']}
          onSelectOrder={setSelectedOrder}
        />
      )}
    </div>
  )
}
