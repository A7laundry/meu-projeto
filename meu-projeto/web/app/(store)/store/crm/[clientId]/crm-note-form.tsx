'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createCrmNote } from '@/actions/crm/notes'
import { CRM_NOTE_CATEGORY_LABELS, type CrmNoteCategory } from '@/types/crm'

interface CrmNoteFormProps {
  clientId: string
  unitId: string
}

const CATEGORIES: CrmNoteCategory[] = ['visit', 'call', 'email', 'other']

export function CrmNoteForm({ clientId, unitId }: CrmNoteFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [category, setCategory] = useState<CrmNoteCategory>('call')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    if (!content.trim()) return
    setError(null)

    const formData = new FormData()
    formData.set('category', category)
    formData.set('content', content.trim())

    startTransition(async () => {
      const result = await createCrmNote(clientId, unitId, formData)
      if (!result.success) {
        setError(result.error)
        return
      }
      setContent('')
      router.refresh()
    })
  }

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Category selector */}
      <div className="flex gap-1 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
            style={category === cat ? {
              background: 'rgba(52,211,153,0.14)',
              border: '1px solid rgba(52,211,153,0.30)',
              color: '#34d399',
            } : {
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.40)',
            }}
          >
            {CRM_NOTE_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Content input */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Registrar nota sobre o cliente..."
        rows={2}
        className="input-premium w-full resize-none"
        style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13 }}
      />

      {error && (
        <p className="text-xs" style={{ color: '#fca5a5' }}>{error}</p>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
          className="px-4 py-2 rounded-lg text-xs font-bold btn-emerald disabled:opacity-40"
        >
          {isPending ? 'Salvando...' : 'Adicionar Nota'}
        </button>
      </div>
    </div>
  )
}
