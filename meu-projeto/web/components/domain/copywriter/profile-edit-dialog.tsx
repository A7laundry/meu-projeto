'use client'

import { useState, useTransition } from 'react'
import { updateMyProfile } from '@/actions/copywriter/gamification'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ProfileEditDialogProps {
  bio: string
  specialties: string[]
  trigger: React.ReactNode
}

export function ProfileEditDialog({ bio, specialties, trigger }: ProfileEditDialogProps) {
  const [bioValue, setBioValue] = useState(bio)
  const [specsValue, setSpecsValue] = useState(specialties.join(', '))
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const specs = specsValue.split(',').map(s => s.trim()).filter(Boolean)
      await updateMyProfile(bioValue, specs)
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-[#0c0c10] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white/90">Editar Perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-xs text-white/50">Bio</label>
            <Textarea
              value={bioValue}
              onChange={(e) => setBioValue(e.target.value)}
              placeholder="Conte sobre você e sua experiência..."
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/50">Especialidades (separadas por vírgula)</label>
            <Input
              value={specsValue}
              onChange={(e) => setSpecsValue(e.target.value)}
              placeholder="SEO, Copywriting, Social Media"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={isPending}
            className="w-full btn-gold rounded-lg font-semibold"
          >
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
