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
import { createClient, updateClient } from '@/actions/clients/crud'
import { CLIENT_TYPE_LABELS, type Client } from '@/types/logistics'

const ACQUISITION_CHANNELS = [
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'google',    label: 'Google',    icon: '🔍' },
  { value: 'referral',  label: 'Indicação', icon: '🤝' },
  { value: 'whatsapp',  label: 'WhatsApp',  icon: '💬' },
  { value: 'facebook',  label: 'Facebook',  icon: '👤' },
  { value: 'other',     label: 'Outro',     icon: '📌' },
]

interface ClientFormDialogProps {
  unitId: string
  client?: Client
  trigger?: React.ReactNode
}

export function ClientFormDialog({ unitId, client, trigger }: ClientFormDialogProps) {
  const [open, setOpen]               = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [isPending, startTransition]  = useTransition()
  const formRef                       = useRef<HTMLFormElement>(null)

  // Estado para preview em tempo real
  const [previewName, setPreviewName]     = useState(client?.name ?? '')
  const [clientType, setClientType]       = useState(client?.type ?? 'pf')
  const [channel, setChannel]             = useState(client?.acquisition_channel ?? '')
  const [showAddress, setShowAddress]     = useState(false)

  const isEditing = Boolean(client)

  // Iniciais do avatar
  const initials = previewName.trim()
    ? previewName.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : isEditing ? '?' : '+'

  function handleOpen(v: boolean) {
    setOpen(v)
    if (v) {
      // reset preview ao abrir
      setPreviewName(client?.name ?? '')
      setClientType(client?.type ?? 'pf')
      setChannel(client?.acquisition_channel ?? '')
      setShowAddress(false)
      setError(null)
    }
  }

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

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button className="btn-gold px-4 py-2 rounded-lg text-sm font-semibold">
            {isEditing ? 'Editar' : '+ Novo Cliente'}
          </button>
        )}
      </DialogTrigger>

      <DialogContent
        className="max-w-xl p-0 overflow-hidden"
        style={{
          background: '#09090f',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* ── Header com preview ──────────────────────────── */}
        <div
          className="px-6 pt-6 pb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(214,178,94,0.10) 0%, rgba(5,5,12,0.9) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <DialogHeader className="mb-4">
            <DialogTitle className="text-white/40 text-xs font-semibold uppercase tracking-widest">
              {isEditing ? 'Editar cadastro' : 'Novo cliente'}
            </DialogTitle>
          </DialogHeader>

          {/* Preview card */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0 transition-all duration-200"
              style={{
                background: previewName.trim()
                  ? 'linear-gradient(135deg, rgba(214,178,94,0.22) 0%, rgba(185,138,44,0.15) 100%)'
                  : 'rgba(255,255,255,0.04)',
                border: previewName.trim()
                  ? '1.5px solid rgba(214,178,94,0.40)'
                  : '1.5px solid rgba(255,255,255,0.08)',
                color: previewName.trim() ? '#d6b25e' : 'rgba(255,255,255,0.20)',
              }}
            >
              {initials}
            </div>

            {/* Nome + tipo */}
            <div className="flex-1 min-w-0">
              <p
                className="text-lg font-semibold truncate transition-all duration-100"
                style={{ color: previewName.trim() ? '#fff' : 'rgba(255,255,255,0.20)' }}
              >
                {previewName.trim() || 'Nome do cliente'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {/* Toggle PF / PJ */}
                <div
                  className="flex rounded-lg overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {(Object.keys(CLIENT_TYPE_LABELS) as Array<keyof typeof CLIENT_TYPE_LABELS>).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setClientType(k)}
                      className="px-3 py-1 text-xs font-semibold transition-all duration-150"
                      style={
                        clientType === k
                          ? { background: 'rgba(214,178,94,0.18)', color: '#d6b25e' }
                          : { background: 'transparent', color: 'rgba(255,255,255,0.30)' }
                      }
                    >
                      {k.toUpperCase()}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-white/30">
                  {CLIENT_TYPE_LABELS[clientType as keyof typeof CLIENT_TYPE_LABELS]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Formulário ──────────────────────────────────── */}
        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* Nome */}
          <div className="space-y-1.5">
            <Label className="text-white/50 text-xs font-medium">Nome completo *</Label>
            <Input
              name="name"
              required
              defaultValue={client?.name}
              placeholder="Ex: Maria Silva ou Lavanderia Central Ltda"
              onChange={(e) => setPreviewName(e.target.value)}
              className="h-11 text-sm"
            />
          </div>

          {/* Documento */}
          <div className="space-y-1.5">
            <Label className="text-white/50 text-xs font-medium">
              {clientType === 'pf' ? 'CPF' : 'CNPJ'}
              <span className="text-white/25 ml-1 font-normal">(opcional)</span>
            </Label>
            <Input
              name="document"
              defaultValue={client?.document ?? ''}
              placeholder={clientType === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
              className="h-11 text-sm"
            />
          </div>

          {/* Divisor: Contato */}
          <SectionDivider label="Contato" />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-white/50 text-xs font-medium">📞 Telefone / WhatsApp</Label>
              <Input
                name="phone"
                defaultValue={client?.phone ?? ''}
                placeholder="(11) 9 0000-0000"
                className="h-11 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/50 text-xs font-medium">✉️ E-mail</Label>
              <Input
                name="email"
                type="email"
                defaultValue={client?.email ?? ''}
                placeholder="email@exemplo.com"
                className="h-11 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/50 text-xs font-medium">
              🎂 Data de aniversário
              <span className="text-white/25 ml-1 font-normal">— para campanhas personalizadas</span>
            </Label>
            <Input
              name="birthday"
              type="date"
              defaultValue={client?.birthday ?? ''}
              className="h-11 text-sm"
            />
          </div>

          {/* Divisor: Como nos encontrou */}
          <SectionDivider label="Como nos encontrou?" />

          <div className="grid grid-cols-3 gap-2">
            {ACQUISITION_CHANNELS.map((ch) => (
              <button
                key={ch.value}
                type="button"
                onClick={() => setChannel(channel === ch.value ? '' : ch.value)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
                style={
                  channel === ch.value
                    ? {
                        background: 'rgba(214,178,94,0.14)',
                        border: '1px solid rgba(214,178,94,0.40)',
                        color: '#d6b25e',
                      }
                    : {
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: 'rgba(255,255,255,0.40)',
                      }
                }
              >
                <span className="text-base">{ch.icon}</span>
                <span className="text-xs font-medium">{ch.label}</span>
              </button>
            ))}
          </div>

          {/* Divisor: Endereço (colapsível) */}
          <button
            type="button"
            onClick={() => setShowAddress(!showAddress)}
            className="flex items-center gap-2 w-full text-left transition-colors"
            style={{ color: 'rgba(255,255,255,0.30)' }}
          >
            <span className="text-xs">{showAddress ? '▾' : '▸'}</span>
            <span
              className="flex-1 h-px"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            />
            <span className="text-xs font-semibold uppercase tracking-wider px-2">
              Endereço {showAddress ? '' : '(opcional)'}
            </span>
            <span
              className="flex-1 h-px"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            />
          </button>

          {showAddress && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-white/50 text-xs">Rua / Avenida</Label>
                  <Input name="address_street" defaultValue={client?.address_street ?? ''} placeholder="Rua das Flores" className="h-10 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs">Número</Label>
                  <Input name="address_number" defaultValue={client?.address_number ?? ''} placeholder="123" className="h-10 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs">Complemento</Label>
                  <Input name="address_complement" defaultValue={client?.address_complement ?? ''} placeholder="Apto 4B" className="h-10 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs">Bairro</Label>
                  <Input name="address_neighborhood" defaultValue={client?.address_neighborhood ?? ''} placeholder="Centro" className="h-10 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs">CEP</Label>
                  <Input name="address_zip" defaultValue={client?.address_zip ?? ''} placeholder="00000-000" className="h-10 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs">Cidade</Label>
                  <Input name="address_city" defaultValue={client?.address_city ?? ''} className="h-10 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs">UF</Label>
                  <Input name="address_state" defaultValue={client?.address_state ?? ''} maxLength={2} placeholder="SP" className="h-10 text-sm" />
                </div>
              </div>
            </div>
          )}

          {/* Observações */}
          <div className="space-y-1.5">
            <Label className="text-white/50 text-xs font-medium">
              💬 Observações internas
              <span className="text-white/25 ml-1 font-normal">(não visível ao cliente)</span>
            </Label>
            <Input
              name="notes"
              defaultValue={client?.notes ?? ''}
              placeholder="Alergias, preferências, observações importantes..."
              className="h-11 text-sm"
            />
          </div>

          {/* Erro */}
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.20)',
                color: '#fca5a5',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 btn-gold py-3 rounded-xl text-sm font-bold disabled:opacity-50 transition-all"
            >
              {isPending
                ? 'Salvando...'
                : isEditing
                ? '✓ Salvar Alterações'
                : '+ Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span
        className="flex-1 h-px"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      />
      <span className="text-[11px] font-bold uppercase tracking-widest text-white/25 px-1 whitespace-nowrap">
        {label}
      </span>
      <span
        className="flex-1 h-px"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      />
    </div>
  )
}
