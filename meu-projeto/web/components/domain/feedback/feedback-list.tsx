import { Badge } from '@/components/ui/badge'
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
  type UatFeedback,
} from '@/types/feedback'
import { MessageSquare } from 'lucide-react'

interface FeedbackListProps {
  feedbacks: UatFeedback[]
}

export function FeedbackList({ feedbacks }: FeedbackListProps) {
  if (feedbacks.length === 0) {
    return (
      <div className="card-dark rounded-xl p-8 text-center">
        <MessageSquare size={32} className="mx-auto text-white/15 mb-3" />
        <p className="text-sm text-white/40">Nenhum feedback enviado ainda.</p>
        <p className="text-xs text-white/25 mt-1">Use o formulário acima para enviar seu primeiro feedback.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white/90">Meus Feedbacks</h2>
      {feedbacks.map((fb) => (
        <div key={fb.id} className="card-dark rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={CATEGORY_COLORS[fb.category]}>
                {CATEGORY_LABELS[fb.category]}
              </Badge>
              {fb.severity && (
                <Badge variant="outline" className={SEVERITY_COLORS[fb.severity]}>
                  {SEVERITY_LABELS[fb.severity]}
                </Badge>
              )}
              <span className="text-[10px] text-white/30">{fb.page_section}</span>
            </div>
            <Badge variant="outline" className={STATUS_COLORS[fb.status]}>
              {STATUS_LABELS[fb.status]}
            </Badge>
          </div>

          <p className="text-sm text-white/70 whitespace-pre-wrap">{fb.description}</p>

          {fb.admin_notes && (
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
              <p className="text-[10px] font-medium text-blue-400/60 mb-1">Resposta da Diretoria</p>
              <p className="text-xs text-white/60 whitespace-pre-wrap">{fb.admin_notes}</p>
            </div>
          )}

          <p className="text-[10px] text-white/20">
            {new Date(fb.created_at).toLocaleString('pt-BR')}
          </p>
        </div>
      ))}
    </div>
  )
}
