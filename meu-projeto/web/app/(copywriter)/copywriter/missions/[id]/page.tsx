import { notFound } from 'next/navigation'
import { getBriefing } from '@/actions/copywriter/briefings'
import { getSubmission, claimBriefing, getSubmissionComments } from '@/actions/copywriter/submissions'
import { getUser } from '@/lib/auth/get-user'
import { DifficultyBadge } from '@/components/domain/copywriter/difficulty-badge'
import { SubmissionEditor } from '@/components/domain/copywriter/submission-editor'
import { FeedbackThread } from '@/components/domain/copywriter/feedback-thread'
import { Button } from '@/components/ui/button'

interface MissionDetailProps {
  params: Promise<{ id: string }>
}

export default async function MissionDetailPage({ params }: MissionDetailProps) {
  const { id } = await params
  const [briefing, user] = await Promise.all([getBriefing(id), getUser()])
  if (!briefing || !user) notFound()

  const submission = user.role === 'copywriter' ? await getSubmission(id) : null
  const comments = submission ? await getSubmissionComments(submission.id) : []

  const isAdmin = ['director', 'unit_manager'].includes(user.role)

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-white/90">{briefing.title}</h1>
          <DifficultyBadge difficulty={briefing.difficulty} />
        </div>
        <div className="flex items-center gap-3 text-xs text-white/40">
          <span className="text-[#d6b25e] font-medium">+{briefing.xp_reward} XP</span>
          <span>·</span>
          <span className="capitalize">{briefing.content_type.replace('_', ' ')}</span>
          {briefing.word_limit && (
            <>
              <span>·</span>
              <span>{briefing.word_limit} palavras</span>
            </>
          )}
          {briefing.deadline && (
            <>
              <span>·</span>
              <span>Deadline: {new Date(briefing.deadline).toLocaleDateString('pt-BR')}</span>
            </>
          )}
        </div>
      </div>

      {/* Briefing completo */}
      <div className="card-stat rounded-xl p-5 space-y-3 animate-fade-up stagger-1">
        <h3 className="section-header">Briefing</h3>
        <p className="text-sm text-white/60 whitespace-pre-wrap leading-relaxed">
          {briefing.description}
        </p>
        {briefing.reference_links.length > 0 && (
          <div className="pt-2 space-y-1">
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Referências</p>
            {briefing.reference_links.map((link, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-[#d6b25e]/70 hover:text-[#d6b25e] truncate"
              >
                {link}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Área do redator */}
      {user.role === 'copywriter' && !submission && briefing.status === 'published' && (
        <div className="card-dark rounded-xl p-5 text-center animate-fade-up stagger-2">
          <p className="text-sm text-white/50 mb-4">Aceite a missão para começar a escrever</p>
          <form action={async () => { 'use server'; await claimBriefing(id) }}>
            <Button type="submit" className="btn-gold rounded-lg px-6 font-semibold">
              Aceitar Missão
            </Button>
          </form>
        </div>
      )}

      {submission && (
        <div className="space-y-6 animate-fade-up stagger-2">
          {/* Status */}
          <div className="flex items-center gap-2">
            <StatusBadge status={submission.status} />
            {submission.score !== null && (
              <span className="text-xs text-white/40">
                Score: <span className="num-stat text-white/70">{submission.score}</span>/100
              </span>
            )}
          </div>

          {/* Editor */}
          {(submission.status === 'claimed' || submission.status === 'revision') && (
            <SubmissionEditor
              submissionId={submission.id}
              initialContent={submission.content}
              wordLimit={briefing.word_limit}
            />
          )}

          {/* Conteúdo submetido (read-only) */}
          {(submission.status === 'submitted' || submission.status === 'approved') && submission.content && (
            <div className="card-dark rounded-xl p-5 space-y-2">
              <h3 className="section-header">Seu Texto</h3>
              <p className="text-xs text-white/60 whitespace-pre-wrap leading-relaxed">
                {submission.content}
              </p>
              <p className="text-[10px] text-white/25 num-stat">{submission.word_count} palavras</p>
            </div>
          )}

          {/* Feedback thread */}
          <FeedbackThread submissionId={submission.id} comments={comments} />
        </div>
      )}

      {/* Visão admin: sem editor, apenas info */}
      {isAdmin && !submission && (
        <div className="card-dark rounded-xl p-5 text-center">
          <p className="text-sm text-white/30">Visão de administrador — gerencie as submissões na aba Avaliações</p>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    claimed: { label: 'Em Progresso', className: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
    submitted: { label: 'Aguardando Review', className: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
    revision: { label: 'Revisão Solicitada', className: 'text-orange-400 bg-orange-400/10 border-orange-400/30' },
    approved: { label: 'Aprovado', className: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
    rejected: { label: 'Rejeitado', className: 'text-red-400 bg-red-400/10 border-red-400/30' },
  }
  const c = config[status] ?? { label: status, className: 'text-white/40 bg-white/5 border-white/10' }
  return (
    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${c.className}`}>
      {c.label}
    </span>
  )
}
