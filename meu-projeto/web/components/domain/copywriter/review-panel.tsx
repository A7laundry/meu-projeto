'use client'

import { useState, useTransition } from 'react'
import { reviewSubmission } from '@/actions/copywriter/submissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Submission } from '@/types/copywriter'

interface ReviewPanelProps {
  submission: Submission
}

export function ReviewPanel({ submission }: ReviewPanelProps) {
  const [score, setScore] = useState(submission.score ?? 80)
  const [isPending, startTransition] = useTransition()

  function handleReview(verdict: 'approved' | 'revision' | 'rejected') {
    startTransition(async () => {
      await reviewSubmission(submission.id, verdict, score)
    })
  }

  return (
    <div className="card-stat rounded-xl p-5 space-y-4">
      <h4 className="section-header">Avaliação</h4>

      {/* Conteúdo submetido */}
      <div className="bg-white/[0.03] rounded-lg p-4 max-h-[300px] overflow-y-auto scrollbar-dark">
        <p className="text-xs text-white/70 whitespace-pre-wrap leading-relaxed">
          {submission.content || 'Nenhum conteúdo submetido.'}
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-white/40">
        <span className="num-stat">{submission.word_count} palavras</span>
        {submission.submitted_at && (
          <>
            <span>·</span>
            <span>Enviado em {new Date(submission.submitted_at).toLocaleString('pt-BR')}</span>
          </>
        )}
      </div>

      {/* Score */}
      <div className="space-y-2">
        <label className="text-xs text-white/50">Score (0–100)</label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            min={0}
            max={100}
            className="bg-white/5 border-white/10 text-white w-24 num-stat"
          />
          <div className="flex-1 h-2 rounded bg-white/5">
            <div
              className="h-full rounded transition-all"
              style={{
                width: `${score}%`,
                background: score >= 85 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171',
              }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={() => handleReview('approved')}
          disabled={isPending}
          className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-400/30 rounded-lg text-xs font-medium"
        >
          Aprovar
        </Button>
        <Button
          onClick={() => handleReview('revision')}
          disabled={isPending}
          className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-400/30 rounded-lg text-xs font-medium"
        >
          Revisão
        </Button>
        <Button
          onClick={() => handleReview('rejected')}
          disabled={isPending}
          className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/30 rounded-lg text-xs font-medium"
        >
          Rejeitar
        </Button>
      </div>
    </div>
  )
}
