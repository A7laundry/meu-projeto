import type { OrderEvent } from '@/types/order'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const SECTOR_LABELS: Record<string, string> = {
  received: 'Recepção',
  sorting: 'Triagem',
  washing: 'Lavagem',
  drying: 'Secagem',
  ironing: 'Passadoria',
  shipping: 'Expedição',
}

const EVENT_LABELS: Record<string, string> = {
  entry: 'Entrada',
  exit: 'Saída',
  alert: 'Alerta',
}

const EVENT_COLORS: Record<string, string> = {
  entry: 'bg-blue-500',
  exit: 'bg-green-500',
  alert: 'bg-amber-500',
}

interface OrderTimelineProps {
  events: OrderEvent[]
}

export function OrderTimeline({ events }: OrderTimelineProps) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-gray-400">Nenhum evento registrado.</p>
  }

  const sorted = [...events].sort(
    (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
  )

  return (
    <ol className="relative border-l border-gray-200 ml-3 space-y-6">
      {sorted.map((event) => (
        <li key={event.id} className="ml-6">
          <span
            className={`absolute -left-1.5 flex h-3 w-3 items-center justify-center rounded-full ring-4 ring-white ${EVENT_COLORS[event.event_type] ?? 'bg-gray-400'}`}
          />
          <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-800">
                {SECTOR_LABELS[event.sector] ?? event.sector} —{' '}
                {EVENT_LABELS[event.event_type] ?? event.event_type}
              </span>
              <time className="text-xs text-gray-400">
                {format(new Date(event.occurred_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </time>
            </div>
            {event.notes && (
              <p className="text-xs text-gray-500">{event.notes}</p>
            )}
            {event.quantity_processed != null && (
              <p className="text-xs text-gray-500">{event.quantity_processed} peças processadas</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
