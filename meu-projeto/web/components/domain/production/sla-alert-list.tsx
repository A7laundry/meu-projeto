'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createOrderEvent } from '@/actions/orders/create'
import type { SlaAlert } from '@/lib/queries/sla-alerts'

const SECTOR_LABELS: Record<string, string> = {
  sorting: 'Triagem',
  washing: 'Lavagem',
  drying: 'Secagem',
  ironing: 'Passadoria',
  shipped: 'Expedição',
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

interface SlaAlertListProps {
  alerts: SlaAlert[]
  unitId: string
  operatorId: string
}

export function SlaAlertList({ alerts, unitId, operatorId }: SlaAlertListProps) {
  const [, startTransition] = useTransition()

  function handleAcknowledge(orderId: string) {
    startTransition(async () => {
      await createOrderEvent(orderId, unitId, {
        sector: 'alert',
        event_type: 'alert',
        operator_id: operatorId,
        notes: 'SLA excedido — ciente',
      })
    })
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">✅</span>
        <h2 className="text-lg font-semibold text-gray-700">Nenhum alerta de SLA</h2>
        <p className="text-sm text-gray-400 mt-1">Todas as comandas estão dentro do prazo.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.orderId}
          className="rounded-xl border-2 border-red-200 bg-red-50 p-4 flex items-start gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/unit/${unitId}/production/orders/${alert.orderId}`}
                className="font-mono font-bold text-lg text-gray-900 hover:underline"
              >
                {alert.orderNumber}
              </Link>
              <Badge variant="destructive">{SECTOR_LABELS[alert.status] ?? alert.status}</Badge>
            </div>
            <p className="text-gray-700 mt-0.5">{alert.clientName}</p>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="text-red-700 font-semibold">
                {formatDuration(alert.minutesInSector)} no setor
              </span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">
                SLA: {formatDuration(alert.slaMinutes)}
              </span>
              <span className="text-gray-400">·</span>
              <span className="text-red-600 font-medium">
                +{formatDuration(alert.excessMinutes)} de atraso
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 border-red-300 text-red-700 hover:bg-red-100"
            onClick={() => handleAcknowledge(alert.orderId)}
          >
            Ciente
          </Button>
        </div>
      ))}
    </div>
  )
}
