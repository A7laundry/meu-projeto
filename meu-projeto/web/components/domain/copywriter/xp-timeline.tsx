import type { WriterXpLog } from '@/types/copywriter'

interface XpTimelineProps {
  logs: WriterXpLog[]
}

export function XpTimeline({ logs }: XpTimelineProps) {
  if (logs.length === 0) {
    return <p className="text-xs text-white/25">Nenhum XP registrado ainda.</p>
  }

  return (
    <div className="space-y-2">
      {logs.map((log, i) => (
        <div
          key={log.id}
          className={`flex items-center gap-3 animate-fade-up stagger-${Math.min(i + 1, 6)}`}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#d6b25e]/10 flex items-center justify-center">
            <span className="text-xs font-bold text-[#d6b25e] num-stat">+{log.amount}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/60 truncate">{log.reason}</p>
            <p className="text-[10px] text-white/25">
              {new Date(log.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
