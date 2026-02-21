'use client'

import { useState, useTransition } from 'react'
import { submitForReview } from '@/actions/copywriter/submissions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface SubmissionEditorProps {
  submissionId: string
  initialContent?: string
  wordLimit?: number | null
  disabled?: boolean
}

export function SubmissionEditor({ submissionId, initialContent = '', wordLimit, disabled }: SubmissionEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isPending, startTransition] = useTransition()
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  function handleSubmit() {
    if (!content.trim()) return
    startTransition(async () => {
      await submitForReview(submissionId, content)
    })
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escreva seu conteúdo aqui..."
        className="min-h-[240px] bg-white/[0.03] border-white/10 text-white/90 placeholder:text-white/20 resize-y"
        disabled={disabled || isPending}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className={`num-stat ${wordLimit && wordCount > wordLimit ? 'text-red-400' : 'text-white/40'}`}>
            {wordCount} palavras
          </span>
          {wordLimit && (
            <span className="text-white/20">/ {wordLimit} limite</span>
          )}
        </div>
        <Button
          onClick={handleSubmit}
          disabled={disabled || isPending || !content.trim()}
          className="btn-gold text-xs px-4 py-2 rounded-lg font-semibold"
        >
          {isPending ? 'Enviando...' : 'Enviar para Avaliação'}
        </Button>
      </div>
    </div>
  )
}
