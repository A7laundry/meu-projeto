'use client'

import { useState, useTransition } from 'react'
import { createFeedback } from '@/actions/feedback/crud'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  PAGE_SECTIONS,
  CATEGORY_LABELS,
  SEVERITY_LABELS,
  type FeedbackCategory,
  type FeedbackSeverity,
} from '@/types/feedback'
import { Bug, Lightbulb, Puzzle, ThumbsUp, Send } from 'lucide-react'

const CATEGORY_ICONS: Record<FeedbackCategory, typeof Bug> = {
  bug: Bug,
  improvement: Lightbulb,
  missing_feature: Puzzle,
  positive: ThumbsUp,
}

export function FeedbackForm() {
  const [category, setCategory] = useState<FeedbackCategory | ''>('')
  const [severity, setSeverity] = useState<FeedbackSeverity | ''>('')
  const [pageSection, setPageSection] = useState('')
  const [description, setDescription] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!category || !pageSection || !description.trim()) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    if (category === 'bug' && !severity) {
      toast.error('Selecione a severidade do bug')
      return
    }

    const fd = new FormData()
    fd.set('category', category)
    fd.set('page_section', pageSection)
    fd.set('description', description.trim())
    if (category === 'bug' && severity) {
      fd.set('severity', severity)
    }

    startTransition(async () => {
      const result = await createFeedback(fd)
      if (result.success) {
        toast.success('Feedback enviado com sucesso!')
        setCategory('')
        setSeverity('')
        setPageSection('')
        setDescription('')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="card-dark rounded-xl p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white/90">Enviar Feedback</h2>
        <p className="text-xs text-white/40 mt-1">
          Reporte bugs, sugira melhorias ou destaque pontos positivos do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Página/Seção */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">Página / Seção *</label>
          <Select value={pageSection} onValueChange={setPageSection}>
            <SelectTrigger className="bg-white/[0.03] border-white/10 text-white/90 text-sm">
              <SelectValue placeholder="Selecione a seção" />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SECTIONS.map((section) => (
                <SelectItem key={section} value={section}>
                  {section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">Tipo *</label>
          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v as FeedbackCategory)
              if (v !== 'bug') setSeverity('')
            }}
          >
            <SelectTrigger className="bg-white/[0.03] border-white/10 text-white/90 text-sm">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CATEGORY_LABELS) as FeedbackCategory[]).map((key) => {
                const Icon = CATEGORY_ICONS[key]
                return (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <Icon size={14} />
                      {CATEGORY_LABELS[key]}
                    </span>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Severidade (só bugs) */}
        {category === 'bug' && (
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-white/60">Severidade *</label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as FeedbackSeverity)}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white/90 text-sm">
                <SelectValue placeholder="Selecione a severidade" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SEVERITY_LABELS) as FeedbackSeverity[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {SEVERITY_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Descrição */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/60">Descrição *</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o que encontrou, o que esperava, ou sua sugestão..."
          className="min-h-[120px] bg-white/[0.03] border-white/10 text-white/90 placeholder:text-white/20 text-sm resize-none"
          disabled={isPending}
        />
        <p className="text-[10px] text-white/25">Mínimo 10 caracteres</p>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isPending || !category || !pageSection || description.trim().length < 10}
        className="w-full sm:w-auto"
      >
        <Send size={14} />
        {isPending ? 'Enviando...' : 'Enviar Feedback'}
      </Button>
    </div>
  )
}
