import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { getReviewQueue } from '@/actions/copywriter/admin'
import { getSubmissionComments } from '@/actions/copywriter/submissions'
import { ReviewPanel } from '@/components/domain/copywriter/review-panel'
import { FeedbackThread } from '@/components/domain/copywriter/feedback-thread'
import { DifficultyBadge } from '@/components/domain/copywriter/difficulty-badge'

export default async function AdminReviewsPage() {
  const user = await getUser()
  if (!user || !['director', 'unit_manager'].includes(user.role)) redirect('/copywriter/dashboard')

  const queue = await getReviewQueue()

  // Pré-carregar todos os comentários em paralelo
  const commentsMap = new Map<string, Awaited<ReturnType<typeof getSubmissionComments>>>()
  if (queue.length > 0) {
    const results = await Promise.all(
      queue.map((s) => getSubmissionComments(s.id))
    )
    queue.forEach((s, i) => commentsMap.set(s.id, results[i]))
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="animate-fade-up">
        <h1 className="text-xl font-bold text-white/90 mb-1">Fila de Avaliações</h1>
        <p className="text-sm text-white/40">
          {queue.length} submission{queue.length !== 1 ? 's' : ''} aguardando review
        </p>
      </div>

      {queue.length === 0 ? (
        <div className="card-dark rounded-xl p-8 text-center animate-fade-up stagger-1">
          <p className="text-sm text-white/30">Nenhuma submissão pendente de avaliação</p>
        </div>
      ) : (
        <div className="space-y-6">
          {queue.map((submission, i) => (
            <div
              key={submission.id}
              className={`space-y-4 animate-fade-up stagger-${Math.min(i + 1, 6)}`}
            >
              {/* Header da submission */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white/90">
                    {submission.briefing?.title ?? 'Briefing'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                    <span>{submission.writer?.full_name ?? 'Redator'}</span>
                    <span>·</span>
                    {submission.briefing && (
                      <DifficultyBadge difficulty={submission.briefing.difficulty} />
                    )}
                    <span>·</span>
                    <span className="text-[#d6b25e]/60">+{submission.briefing?.xp_reward ?? 0} XP</span>
                  </div>
                </div>
              </div>

              {/* Painel de review */}
              <ReviewPanel submission={submission} />

              {/* Thread de feedback */}
              <FeedbackThread submissionId={submission.id} comments={commentsMap.get(submission.id) ?? []} />

              {/* Separador */}
              {i < queue.length - 1 && (
                <div className="border-t border-white/5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
