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
import { createClient, updateClient } from '@/actions/clients/crud'
import { CLIENT_TYPE_LABELS, type Client } from '@/types/logistics'

interface ClientFormDialogProps {
  unitId: string
  client?: Client
  trigger?: React.ReactNode
}

export function ClientFormDialog({ unitId, client, trigger }: ClientFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const [clientType, setClientType] = useState<string>(client?.type ?? 'pj')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('type', clientType)

    startTransition(async () => {
      const result = client
        ? await updateClient(client.id, unitId, formData)
        : await createClient(unitId, formData)

      if (!result.success) {
        setError(result.error)
        return
      }
      setOpen(false)
      formRef.current?.reset()
    })
  }

  const isEditing = Boolean(client)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">{isEditing ? 'Editar' : 'Novo Cliente'}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={client?.name}
                placeholder="Nome do cliente"
              />
            </div>

            <div className="space-y-1">
              <Label>Tipo *</Label>
              <Select value={clientType} onValueChange={setClientType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CLIENT_TYPE_LABELS) as Array<keyof typeof CLIENT_TYPE_LABELS>).map(
                    (key) => (
                      <SelectItem key={key} value={key}>
                        {CLIENT_TYPE_LABELS[key]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="document">
                {clientType === 'pf' ? 'CPF' : 'CNPJ'}
              </Label>
              <Input
                id="document"
                name="document"
                defaultValue={client?.document ?? ''}
                placeholder={clientType === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={client?.phone ?? ''}
                placeholder="(11) 9 0000-0000"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={client?.email ?? ''}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Endereço</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <Label htmlFor="address_street">Rua / Avenida</Label>
                <Input
                  id="address_street"
                  name="address_street"
                  defaultValue={client?.address_street ?? ''}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="address_number">Número</Label>
                <Input
                  id="address_number"
                  name="address_number"
                  defaultValue={client?.address_number ?? ''}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="address_complement">Complemento</Label>
                <Input
                  id="address_complement"
                  name="address_complement"
                  defaultValue={client?.address_complement ?? ''}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="address_neighborhood">Bairro</Label>
                <Input
                  id="address_neighborhood"
                  name="address_neighborhood"
                  defaultValue={client?.address_neighborhood ?? ''}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="address_zip">CEP</Label>
                <Input
                  id="address_zip"
                  name="address_zip"
                  defaultValue={client?.address_zip ?? ''}
                  placeholder="00000-000"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="address_city">Cidade</Label>
                <Input
                  id="address_city"
                  name="address_city"
                  defaultValue={client?.address_city ?? ''}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="address_state">Estado</Label>
                <Input
                  id="address_state"
                  name="address_state"
                  defaultValue={client?.address_state ?? ''}
                  maxLength={2}
                  placeholder="SP"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              name="notes"
              defaultValue={client?.notes ?? ''}
              placeholder="Observações internas"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
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
