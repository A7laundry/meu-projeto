'use client'

import { useRef, useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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

  const [previewName, setPreviewName]     = useState(client?.name ?? '')
  const [clientType, setClientType]       = useState(client?.type ?? 'pf')
  const [channel, setChannel]             = useState(client?.acquisition_channel ?? '')
  const [showAddress, setShowAddress]     = useState(false)

  const isEditing = Boolean(client)

  const initials = previewName.trim()
    ? previewName.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : isEditing ? '?' : '+'

  function handleOpen(v: boolean) {
    setOpen(v)
    if (v) {
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
          <button
            style={{
              background: 'linear-gradient(135deg, #d6b25e 0%, #f0d080 100%)',
              color: '#05050a',
              fontWeight: 700,
              fontSize: 13,
              padding: '9px 18px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(214,178,94,0.25)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {isEditing ? '✏️ Editar' : '+ Novo Cliente'}
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
            <DialogTitle
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'rgba(214,178,94,0.55)' }}
            >
              {isEditing ? '✏️ Editar cadastro' : '👤 Novo cliente'}
            </DialogTitle>
          </DialogHeader>

          {/* Preview card */}
          <div className="flex items-center gap-4">
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

            <div className="flex-1 min-w-0">
              <p
                className="text-lg font-semibold truncate transition-all duration-100"
                style={{ color: previewName.trim() ? '#fff' : 'rgba(255,255,255,0.20)' }}
              >
                {previewName.trim() || 'Nome do cliente'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="flex rounded-lg overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.10)' }}
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
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {CLIENT_TYPE_LABELS[clientType as keyof typeof CLIENT_TYPE_LABELS]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Formulário ──────────────────────────────────── */}
        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Nome */}
          <div className="space-y-1.5">
            <Label style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 600 }}>
              Nome completo *
            </Label>
            <input
              name="name"
              required
              defaultValue={client?.name}
              placeholder="Ex: Maria Silva ou Lavanderia Central Ltda"
              onChange={(e) => setPreviewName(e.target.value)}
              className="input-premium w-full"
              style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
            />
          </div>

          {/* Documento */}
          <div className="space-y-1.5">
            <Label style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 600 }}>
              {clientType === 'pf' ? 'CPF' : 'CNPJ'}
              <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400, marginLeft: 6 }}>(opcional)</span>
            </Label>
            <input
              name="document"
              defaultValue={client?.document ?? ''}
              placeholder={clientType === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
              className="input-premium w-full"
              style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
            />
          </div>

          <SectionDivider label="Contato" />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 600 }}>
                📞 Telefone / WhatsApp
              </Label>
              <input
                name="phone"
                defaultValue={client?.phone ?? ''}
                placeholder="(11) 9 0000-0000"
                className="input-premium w-full"
                style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
              />
            </div>
            <div className="space-y-1.5">
              <Label style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 600 }}>
                ✉️ E-mail
              </Label>
              <input
                name="email"
                type="email"
                defaultValue={client?.email ?? ''}
                placeholder="email@exemplo.com"
                className="input-premium w-full"
                style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 600 }}>
              🎂 Data de aniversário
              <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400, marginLeft: 6 }}>— para campanhas personalizadas</span>
            </Label>
            <input
              name="birthday"
              type="date"
              defaultValue={client?.birthday ?? ''}
              className="input-premium w-full"
              style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14, colorScheme: 'dark' }}
            />
          </div>

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
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        color: 'rgba(255,255,255,0.65)',
                      }
                }
              >
                <span className="text-base">{ch.icon}</span>
                <span className="text-xs font-medium">{ch.label}</span>
              </button>
            ))}
          </div>

          {/* Endereço (colapsível) */}
          <button
            type="button"
            onClick={() => setShowAddress(!showAddress)}
            className="flex items-center gap-2 w-full text-left transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <span className="text-xs">{showAddress ? '▾' : '▸'}</span>
            <span className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-xs font-semibold uppercase tracking-wider px-2">
              Endereço {showAddress ? '' : '(opcional)'}
            </span>
            <span className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </button>

          {showAddress && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1.5">
                  <Label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Rua / Avenida</Label>
                  <input name="address_street" defaultValue={client?.address_street ?? ''} placeholder="Rua das Flores" className="input-premium w-full" style={{ padding: '9px 12px', borderRadius: 9, fontSize: 13 }} />
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Número</Label>
                  <input name="address_number" defaultValue={client?.address_number ?? ''} placeholder="123" className="input-premium w-full" style={{ padding: '9px 12px', borderRadius: 9, fontSize: 13 }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Complemento</Label>
                  <input name="address_complement" defaultValue={client?.address_complement ?? ''} placeholder="Apto 4B" className="input-premium w-full" style={{ padding: '9px 12px', borderRadius: 9, fontSize: 13 }} />
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Bairro</Label>
                  <input name="address_neighborhood" defaultValue={client?.address_neighborhood ?? ''} placeholder="Centro" className="input-premium w-full" style={{ padding: '9px 12px', borderRadius: 9, fontSize: 13 }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>CEP</Label>
                  <input name="address_zip" defaultValue={client?.address_zip ?? ''} placeholder="00000-000" className="input-premium w-full" style={{ padding: '9px 12px', borderRadius: 9, fontSize: 13 }} />
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Cidade</Label>
                  <input name="address_city" defaultValue={client?.address_city ?? ''} className="input-premium w-full" style={{ padding: '9px 12px', borderRadius: 9, fontSize: 13 }} />
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>UF</Label>
                  <input name="address_state" defaultValue={client?.address_state ?? ''} maxLength={2} placeholder="SP" className="input-premium w-full" style={{ padding: '9px 12px', borderRadius: 9, fontSize: 13 }} />
                </div>
              </div>
            </div>
          )}

          {/* Observações */}
          <div className="space-y-1.5">
            <Label style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 600 }}>
              💬 Observações internas
              <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400, marginLeft: 6 }}>(não visível ao cliente)</span>
            </Label>
            <input
              name="notes"
              defaultValue={client?.notes ?? ''}
              placeholder="Alergias, preferências, observações importantes..."
              className="input-premium w-full"
              style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14 }}
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
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.65)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 12,
                border: 'none',
                background: isPending
                  ? 'rgba(214,178,94,0.40)'
                  : 'linear-gradient(135deg, #d6b25e 0%, #f0d080 100%)',
                color: '#05050a',
                fontSize: 14,
                fontWeight: 700,
                cursor: isPending ? 'not-allowed' : 'pointer',
                boxShadow: isPending ? 'none' : '0 4px 20px rgba(214,178,94,0.25)',
                transition: 'all 0.15s',
              }}
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
      <span className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
      <span
        className="text-[10px] font-bold uppercase tracking-widest px-1 whitespace-nowrap"
        style={{ color: 'rgba(214,178,94,0.50)' }}
      >
        {label}
      </span>
      <span className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
    </div>
  )
}
