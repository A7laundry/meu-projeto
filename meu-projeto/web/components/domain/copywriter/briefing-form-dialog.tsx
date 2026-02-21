'use client'

import { useTransition } from 'react'
import { createBriefing, updateBriefing } from '@/actions/copywriter/briefings'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Briefing } from '@/types/copywriter'

interface BriefingFormDialogProps {
  briefing?: Briefing | null
  trigger: React.ReactNode
}

export function BriefingFormDialog({ briefing, trigger }: BriefingFormDialogProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!briefing

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEditing) {
        await updateBriefing(briefing!.id, formData)
      } else {
        await createBriefing(formData)
      }
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-[#0c0c10] border-white/10 text-white max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white/90">
            {isEditing ? 'Editar Briefing' : 'Novo Briefing'}
          </DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-xs text-white/50">Título</label>
            <Input
              name="title"
              defaultValue={briefing?.title ?? ''}
              required
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/50">Descrição / Briefing</label>
            <Textarea
              name="description"
              defaultValue={briefing?.description ?? ''}
              required
              className="bg-white/5 border-white/10 text-white min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs text-white/50">Tipo de Conteúdo</label>
              <select
                name="content_type"
                defaultValue={briefing?.content_type ?? 'blog'}
                className="w-full rounded-md bg-white/5 border border-white/10 text-white text-sm px-3 py-2"
              >
                <option value="blog">Blog</option>
                <option value="social">Social Media</option>
                <option value="email">E-mail</option>
                <option value="ad">Anúncio</option>
                <option value="landing">Landing Page</option>
                <option value="video_script">Script de Vídeo</option>
                <option value="press">Press Release</option>
                <option value="other">Outro</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/50">Dificuldade</label>
              <select
                name="difficulty"
                defaultValue={briefing?.difficulty ?? 'medium'}
                className="w-full rounded-md bg-white/5 border border-white/10 text-white text-sm px-3 py-2"
              >
                <option value="easy">Fácil</option>
                <option value="medium">Médio</option>
                <option value="hard">Difícil</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-xs text-white/50">XP Recompensa</label>
              <Input
                name="xp_reward"
                type="number"
                defaultValue={briefing?.xp_reward ?? 50}
                min={10}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/50">Vagas</label>
              <Input
                name="max_writers"
                type="number"
                defaultValue={briefing?.max_writers ?? 1}
                min={1}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/50">Limite Palavras</label>
              <Input
                name="word_limit"
                type="number"
                defaultValue={briefing?.word_limit ?? ''}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/50">Deadline</label>
            <Input
              name="deadline"
              type="datetime-local"
              defaultValue={briefing?.deadline?.slice(0, 16) ?? ''}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/50">Links de Referência (um por linha)</label>
            <Textarea
              name="reference_links"
              defaultValue={briefing?.reference_links?.join('\n') ?? ''}
              className="bg-white/5 border-white/10 text-white min-h-[60px]"
              placeholder="https://exemplo.com/referencia"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full btn-gold rounded-lg font-semibold"
          >
            {isPending ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Briefing'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
