'use client'

import { useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createCrmNote } from '@/actions/crm/notes'
import { CRM_NOTE_CATEGORY_LABELS } from '@/types/crm'

interface CrmNoteFormProps {
  clientId: string
  unitId: string
}

export function CrmNoteForm({ clientId, unitId }: CrmNoteFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [category, setCategory] = useState<string>('other')
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('category', category)

    startTransition(async () => {
      const result = await createCrmNote(clientId, unitId, formData)
      if (!result.success) {
        setError(result.error)
        return
      }
      formRef.current?.reset()
      setCategory('other')
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label>Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                Object.keys(CRM_NOTE_CATEGORY_LABELS) as Array<keyof typeof CRM_NOTE_CATEGORY_LABELS>
              ).map((key) => (
                <SelectItem key={key} value={key}>
                  {CRM_NOTE_CATEGORY_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1">
          <Label htmlFor="content">Nota *</Label>
          <textarea
            id="content"
            name="content"
            required
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            placeholder="Descreva o contato ou observação..."
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Registrar nota'}
      </Button>
    </form>
  )
}
