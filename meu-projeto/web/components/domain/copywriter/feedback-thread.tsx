'use client'

import { useState, useTransition } from 'react'
import { addComment } from '@/actions/copywriter/submissions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { SubmissionComment } from '@/types/copywriter'

interface FeedbackThreadProps {
  submissionId: string
  comments: SubmissionComment[]
}

export function FeedbackThread({ submissionId, comments }: FeedbackThreadProps) {
  const [newComment, setNewComment] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!newComment.trim()) return
    startTransition(async () => {
      await addComment(submissionId, newComment)
      setNewComment('')
    })
  }

  return (
    <div className="space-y-4">
      <h4 className="section-header">Feedback</h4>

      {comments.length === 0 ? (
        <p className="text-xs text-white/25">Nenhum comentário ainda.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="card-dark rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white/70">
                  {c.author?.full_name ?? 'Anônimo'}
                </span>
                <span className="text-[10px] text-white/25">
                  {new Date(c.created_at).toLocaleString('pt-BR')}
                </span>
              </div>
              <p className="text-xs text-white/50 whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escreva um comentário..."
          className="min-h-[60px] bg-white/[0.03] border-white/10 text-white/90 placeholder:text-white/20 text-xs resize-none flex-1"
          disabled={isPending}
        />
        <Button
          onClick={handleSubmit}
          disabled={isPending || !newComment.trim()}
          className="btn-ghost text-xs px-3 rounded-lg self-end"
        >
          Enviar
        </Button>
      </div>
    </div>
  )
}
