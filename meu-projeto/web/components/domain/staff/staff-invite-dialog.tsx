'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { inviteStaff } from '@/actions/staff/invite'

const SECTORS = [
  { value: 'sorting',  label: 'Triagem' },
  { value: 'washing',  label: 'Lavagem' },
  { value: 'drying',   label: 'Secagem' },
  { value: 'ironing',  label: 'Passadoria' },
  { value: 'shipping', label: 'Expedição' },
]

interface StaffInviteDialogProps {
  unitId: string
}

export function StaffInviteDialog({ unitId }: StaffInviteDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('operator')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await inviteStaff(unitId, new FormData(e.currentTarget))
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setSuccess(true)
    setTimeout(() => { setOpen(false); setSuccess(false) }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">+ Convidar Funcionário</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar Funcionário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}
          {success && <p className="text-sm text-green-700 bg-green-50 rounded p-2">Convite enviado com sucesso!</p>}

          <div className="space-y-1">
            <Label htmlFor="full_name">Nome completo *</Label>
            <Input id="full_name" name="full_name" required placeholder="João da Silva" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" required placeholder="joao@email.com" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="role">Função *</Label>
            <select
              id="role" name="role" required
              value={role}
              onChange={e => setRole(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            >
              <option value="operator">Operador</option>
              <option value="driver">Motorista</option>
            </select>
          </div>

          {role === 'operator' && (
            <div className="space-y-1">
              <Label htmlFor="sector">Setor *</Label>
              <select
                id="sector" name="sector" required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              >
                <option value="">Selecione...</option>
                {SECTORS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          {role === 'driver' && (
            <input type="hidden" name="sector" value="" />
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
