'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toggleClientActive } from '@/actions/clients/crud'
import { ClientFormDialog } from '@/components/domain/client/client-form-dialog'
import { CLIENT_TYPE_LABELS, type Client } from '@/types/logistics'

interface ClientListProps {
  unitId: string
  initialClients: Client[]
}

const ACQUISITION_ICONS: Record<string, string> = {
  instagram: '📸',
  google:    '🔍',
  referral:  '🤝',
  whatsapp:  '💬',
  facebook:  '👤',
  other:     '📌',
}

export function ClientList({ unitId, initialClients }: ClientListProps) {
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = initialClients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.document ?? '').includes(search) ||
      (c.phone ?? '').includes(search) ||
      (c.email ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  function handleToggle(client: Client) {
    startTransition(async () => {
      await toggleClientActive(client.id, unitId, !client.active)
    })
  }

  return (
    <div className="space-y-5">
      {/* Barra de busca + novo cliente */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">
            🔍
          </span>
          <input
            placeholder="Buscar por nome, documento, telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-premium w-full pl-9"
            style={{ padding: '9px 14px 9px 36px', borderRadius: 10, fontSize: 14 }}
          />
        </div>
        <ClientFormDialog unitId={unitId} />
      </div>

      {/* Contagem */}
      <p className="text-xs text-white/30">
        {filtered.length} cliente{filtered.length !== 1 ? 's' : ''}
        {search && ` encontrado${filtered.length !== 1 ? 's' : ''}`}
      </p>

      {/* Grid de cards */}
      {filtered.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-3xl mb-3">👥</p>
          <p className="text-white/50 font-medium">
            {search ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
          </p>
          {!search && (
            <p className="text-sm text-white/25 mt-1">
              Clique em &quot;+ Novo Cliente&quot; para começar.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              unitId={unitId}
              isPending={isPending}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ClientCard({
  client,
  unitId,
  isPending,
  onToggle,
}: {
  client: Client
  unitId: string
  isPending: boolean
  onToggle: (c: Client) => void
}) {
  const initials = client.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const acqIcon = client.acquisition_channel
    ? ACQUISITION_ICONS[client.acquisition_channel] ?? '📌'
    : null

  return (
    <div
      className={`rounded-xl p-4 flex flex-col gap-3 transition-all ${!client.active ? 'opacity-50' : ''}`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Header: avatar + nome + tipo */}
      <div className="flex items-start gap-3">
        {/* Avatar com iniciais */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
          style={{
            background: 'rgba(214,178,94,0.12)',
            border: '1px solid rgba(214,178,94,0.22)',
            color: '#d6b25e',
          }}
        >
          {initials}
        </div>

        {/* Nome + tipo */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/unit/${unitId}/clients/${client.id}`}
            className="block text-sm font-semibold text-white/90 hover:text-[#d6b25e] transition-colors truncate"
          >
            {client.name}
          </Link>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              {CLIENT_TYPE_LABELS[client.type as keyof typeof CLIENT_TYPE_LABELS] ?? 'Outro'}
            </span>
            {!client.active && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.25)',
                }}
              >
                Inativo
              </span>
            )}
            {acqIcon && (
              <span className="text-xs" title={client.acquisition_channel ?? ''}>
                {acqIcon}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contato */}
      {(client.phone || client.email) && (
        <div className="space-y-0.5">
          {client.phone && (
            <p className="text-xs text-white/40 truncate">📞 {client.phone}</p>
          )}
          {client.email && (
            <p className="text-xs text-white/35 truncate">✉️ {client.email}</p>
          )}
        </div>
      )}

      {/* Endereço resumido */}
      {(client.address_street || client.address_city) && (
        <p className="text-[11px] text-white/28 truncate">
          📍 {[client.address_street, client.address_city].filter(Boolean).join(', ')}
        </p>
      )}

      {/* Ações */}
      <div
        className="flex items-center gap-2 pt-1 mt-auto border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <ClientFormDialog
          unitId={unitId}
          client={client}
          trigger={
            <button
              className="text-xs text-white/40 hover:text-white/65 transition-colors px-2 py-1 rounded-md hover:bg-white/05"
            >
              Editar
            </button>
          }
        />
        <button
          disabled={isPending}
          onClick={() => onToggle(client)}
          className="text-xs text-white/30 hover:text-white/55 transition-colors px-2 py-1 rounded-md hover:bg-white/05 ml-auto disabled:opacity-40"
        >
          {client.active ? 'Desativar' : 'Ativar'}
        </button>
        <Link
          href={`/unit/${unitId}/clients/${client.id}`}
          className="text-xs px-2 py-1 rounded-md transition-colors"
          style={{ color: '#d6b25e', background: 'rgba(214,178,94,0.08)' }}
        >
          Ver →
        </Link>
      </div>
    </div>
  )
}
