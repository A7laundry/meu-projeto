'use client'

import { useRef, useState, useTransition } from 'react'
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

const ACQUISITION_CHANNELS = [
  { value: 'instagram',  label: 'Instagram',   icon: '📸' },
  { value: 'google',     label: 'Google',       icon: '🔍' },
  { value: 'referral',   label: 'Indicação',    icon: '🤝' },
  { value: 'whatsapp',   label: 'WhatsApp',     icon: '💬' },
  { value: 'facebook',   label: 'Facebook',     icon: '👤' },
  { value: 'other',      label: 'Outro',        icon: '📌' },
]

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
  const [clientType, setClientType] = useState<string>(client?.type ?? 'pf')
  const [channel, setChannel] = useState<string>(client?.acquisition_channel ?? '')
  const [showAddress, setShowAddress] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('type', clientType)
    if (channel) formData.set('acquisition_channel', channel)

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
          <button className="btn-gold px-4 py-2 rounded-lg text-sm font-semibold">
            {isEditing ? 'Editar' : '+ Novo Cliente'}
          </button>
        )}
      </DialogTrigger>

      <DialogContent
        className="max-w-lg max-h-[92vh] overflow-y-auto"
        style={{
          background: '#0d0d14',
          border: '1px solid rgba(214,178,94,0.15)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-white font-semibold">
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 mt-2">

          {/* ── Informações básicas ─────────────────────────── */}
          <section className="space-y-3">
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold border-b border-white/08 pb-1.5">
              Dados do Cliente
            </p>

            <div className="space-y-1.5">
              <Label className="text-white/60 text-xs">Nome completo *</Label>
              <Input
                name="name"
                required
                defaultValue={client?.name}
                placeholder="Nome do cliente ou empresa"
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs">Tipo</Label>
                <Select value={clientType} onValueChange={setClientType}>
                  <SelectTrigger className="h-11">
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

              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs">
                  {clientType === 'pf' ? 'CPF' : 'CNPJ'}
                </Label>
                <Input
                  name="document"
                  defaultValue={client?.document ?? ''}
                  placeholder={clientType === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                  className="h-11"
                />
              </div>
            </div>
          </section>

          {/* ── Contato ────────────────────────────────────── */}
          <section className="space-y-3">
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold border-b border-white/08 pb-1.5">
              Contato
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs">Telefone / WhatsApp</Label>
                <Input
                  name="phone"
                  defaultValue={client?.phone ?? ''}
                  placeholder="(11) 9 0000-0000"
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs">E-mail</Label>
                <Input
                  name="email"
                  type="email"
                  defaultValue={client?.email ?? ''}
                  placeholder="email@exemplo.com"
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/60 text-xs">Data de aniversário</Label>
              <Input
                name="birthday"
                type="date"
                defaultValue={client?.birthday ?? ''}
                className="h-11"
              />
              <p className="text-[11px] text-white/25">
                Usada para campanhas de aniversário personalizadas
              </p>
            </div>
          </section>

          {/* ── Marketing ──────────────────────────────────── */}
          <section className="space-y-3">
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold border-b border-white/08 pb-1.5">
              Marketing &amp; Aquisição
            </p>

            <div className="space-y-1.5">
              <Label className="text-white/60 text-xs">Como nos encontrou?</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecionar canal..." />
                </SelectTrigger>
                <SelectContent>
                  {ACQUISITION_CHANNELS.map((ch) => (
                    <SelectItem key={ch.value} value={ch.value}>
                      <span className="flex items-center gap-2">
                        <span>{ch.icon}</span>
                        <span>{ch.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-white/25">
                Métrica de canal de aquisição para relatórios de marketing
              </p>
            </div>
          </section>

          {/* ── Endereço (colapsável) ───────────────────────── */}
          <section className="space-y-3">
            <button
              type="button"
              onClick={() => setShowAddress(!showAddress)}
              className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider font-semibold border-b border-white/08 pb-1.5 w-full text-left hover:text-white/60 transition-colors"
            >
              <span>{showAddress ? '▾' : '▸'}</span>
              <span>Endereço {showAddress ? '' : '(opcional)'}</span>
            </button>

            {showAddress && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-white/60 text-xs">Rua / Avenida</Label>
                    <Input
                      name="address_street"
                      defaultValue={client?.address_street ?? ''}
                      placeholder="Rua das Flores"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/60 text-xs">Número</Label>
                    <Input
                      name="address_number"
                      defaultValue={client?.address_number ?? ''}
                      placeholder="123"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-white/60 text-xs">Complemento</Label>
                    <Input
                      name="address_complement"
                      defaultValue={client?.address_complement ?? ''}
                      placeholder="Apto 4B"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/60 text-xs">Bairro</Label>
                    <Input
                      name="address_neighborhood"
                      defaultValue={client?.address_neighborhood ?? ''}
                      placeholder="Centro"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-white/60 text-xs">CEP</Label>
                    <Input
                      name="address_zip"
                      defaultValue={client?.address_zip ?? ''}
                      placeholder="00000-000"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/60 text-xs">Cidade</Label>
                    <Input
                      name="address_city"
                      defaultValue={client?.address_city ?? ''}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/60 text-xs">UF</Label>
                    <Input
                      name="address_state"
                      defaultValue={client?.address_state ?? ''}
                      maxLength={2}
                      placeholder="SP"
                      className="h-10"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Observações internas</Label>
            <Input
              name="notes"
              defaultValue={client?.notes ?? ''}
              placeholder="Alergias a produtos, preferências, etc."
              className="h-10"
            />
          </div>

          {error && (
            <p className="text-sm px-3 py-2 rounded-lg"
              style={{ background: 'rgba(248,113,113,0.08)', color: '#fca5a5', border: '1px solid rgba(248,113,113,0.20)' }}>
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/60 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 btn-gold py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {isPending ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
