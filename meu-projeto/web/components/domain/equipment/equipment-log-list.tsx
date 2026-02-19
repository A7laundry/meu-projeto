import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { EQUIPMENT_LOG_TYPE_LABELS, type EquipmentLog, type EquipmentLogType } from '@/types/equipment-log'

const LOG_TYPE_VARIANT: Record<EquipmentLogType, 'default' | 'secondary' | 'destructive'> = {
  use: 'secondary',
  maintenance: 'default',
  incident: 'destructive',
  repair_completed: 'default',
}

interface EquipmentLogListProps {
  logs: EquipmentLog[]
}

export function EquipmentLogList({ logs }: EquipmentLogListProps) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        Nenhum registro no diário de bordo.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-4 items-start p-3 rounded-lg border bg-white">
          <div className="flex-shrink-0 pt-0.5">
            <Badge variant={LOG_TYPE_VARIANT[log.log_type]}>
              {EQUIPMENT_LOG_TYPE_LABELS[log.log_type]}
            </Badge>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{format(new Date(log.occurred_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
              {log.operator_name && <span>· {log.operator_name}</span>}
              {log.cycles != null && (
                <span className="text-blue-600 font-medium">{log.cycles} ciclo(s)</span>
              )}
            </div>
            {log.notes && <p className="text-sm text-gray-700 mt-0.5">{log.notes}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
