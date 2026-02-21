'use client'

import { useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createRoute, updateRoute } from '@/actions/routes/crud'
import {
  ROUTE_SHIFT_LABELS,
  WEEKDAY_LABELS,
  type LogisticsRoute,
} from '@/types/logistics'

interface RouteFormDialogProps {
  unitId: string
  route?: LogisticsRoute
  trigger?: React.ReactNode
}

export function RouteFormDialog({ unitId, route, trigger }: RouteFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const [shift, setShift] = useState<string>(route?.shift ?? 'morning')
  const [weekdays, setWeekdays] = useState<number[]>(route?.weekdays ?? [1, 2, 3, 4, 5])

  function toggleWeekday(day: number) {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (weekdays.length === 0) {
      setError('Selecione ao menos um dia da semana')
      return
    }
    const formData = new FormData(e.currentTarget)
    formData.set('shift', shift)
    weekdays.forEach((d) => formData.append('weekdays', String(d)))

    startTransition(async () => {
      const result = route
        ? await updateRoute(route.id, unitId, formData)
        : await createRoute(unitId, formData)

      if (!result.success) {
        setError(result.error)
        return
      }
      setOpen(false)
      formRef.current?.reset()
    })
  }

  const isEditing = Boolean(route)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">{isEditing ? 'Editar' : 'Nova Rota'}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Rota' : 'Nova Rota'}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Nome da rota *</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={route?.name}
              placeholder="Ex: Rota Centro Manhã"
            />
          </div>

          <div className="space-y-1">
            <Label>Turno *</Label>
            <Select value={shift} onValueChange={setShift}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.keys(ROUTE_SHIFT_LABELS) as Array<keyof typeof ROUTE_SHIFT_LABELS>
                ).map((key) => (
                  <SelectItem key={key} value={key}>
                    {ROUTE_SHIFT_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Dias da semana *</Label>
            <div className="flex gap-2 flex-wrap">
              {WEEKDAY_LABELS.map((label, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleWeekday(idx)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    weekdays.includes(idx)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-[rgba(255,255,255,0.04)] text-gray-600 border-white/10 hover:border-blue-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
