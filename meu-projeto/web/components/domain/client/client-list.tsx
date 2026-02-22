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

const STAT_CARD_STYLE = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14,
  padding: '14px 18px',
  flex: 1,
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

  const stats = {
    total:  initialClients.length,
    active: initialClients.filter(c => c.active).length,
    pf:     initialClients.filter(c => c.type === 'pf').length,
    pj:     initialClients.filter(c => c.type === 'pj').length,
  }

  function handleToggle(client: Client) {
    startTransition(async () => {
      await toggleClientActive(client.id, unitId, !client.active)
    })
  }

  return (
    <div className="space-y-5">

      {/* ── Métricas ───────────────────────────────────── */}
      {initialClients.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <div style={STAT_CARD_STYLE}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Total
            </p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
              {stats.total}
            </p>
          </div>
          <div style={STAT_CARD_STYLE}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Ativos
            </p>
            <div className="flex items-end gap-2 mt-0.5">
              <p className="text-2xl font-bold" style={{ color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>
                {stats.active}
              </p>
              {stats.total > 0 && (
                <p className="text-xs pb-0.5" style={{ color: 'rgba(52,211,153,0.60)' }}>
                  {Math.round((stats.active / stats.total) * 100)}%
                </p>
              )}
            </div>
          </div>
          <div style={STAT_CARD_STYLE}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Pessoa Física
            </p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: '#d6b25e', fontVariantNumeric: 'tabular-nums' }}>
              {stats.pf}
            </p>
          </div>
          <div style={STAT_CARD_STYLE}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Pessoa Jurídica
            </p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: '#a78bfa', fontVariantNumeric: 'tabular-nums' }}>
              {stats.pj}
            </p>
          </div>
        </div>
      )}

      {/* ── Barra de busca + novo cliente ──────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: 'rgba(255,255,255,0.30)' }}>
            🔍
          </span>
          <input
            placeholder="Buscar por nome, documento, telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-premium w-full"
            style={{ padding: '9px 14px 9px 36px', borderRadius: 10, fontSize: 14 }}
          />
        </div>
        <ClientFormDialog unitId={unitId} />
      </div>

      {/* Contagem de resultados */}
      {search && (
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
          {filtered.length} cliente{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* ── Grid de cards ──────────────────────────────── */}
      {filtered.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-3xl mb-3">{search ? '🔍' : '👥'}</p>
          <p className="font-medium" style={{ color: 'rgba(255,255,255,0.50)' }}>
            {search ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
          </p>
          {!search && (
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
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
      className="rounded-xl flex flex-col gap-3 transition-all duration-200 group"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        padding: '16px',
        opacity: client.active ? 1 : 0.55,
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(214,178,94,0.22)'
        ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.045)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'
        ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'
      }}
    >
      {/* Header: avatar + nome + tipo */}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
          style={{
            background: 'linear-gradient(135deg, rgba(214,178,94,0.15) 0%, rgba(185,138,44,0.08) 100%)',
            border: '1px solid rgba(214,178,94,0.25)',
            color: '#d6b25e',
          }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <Link
            href={`/unit/${unitId}/clients/${client.id}`}
            className="block text-sm font-semibold truncate transition-colors duration-150"
            style={{ color: 'rgba(255,255,255,0.88)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#d6b25e')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.88)')}
          >
            {client.name}
          </Link>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{
                background: client.type === 'pj'
                  ? 'rgba(167,139,250,0.10)'
                  : 'rgba(255,255,255,0.06)',
                border: client.type === 'pj'
                  ? '1px solid rgba(167,139,250,0.22)'
                  : '1px solid rgba(255,255,255,0.10)',
                color: client.type === 'pj'
                  ? 'rgba(167,139,250,0.85)'
                  : 'rgba(255,255,255,0.45)',
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
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
              📞 {client.phone}
            </p>
          )}
          {client.email && (
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>
              ✉️ {client.email}
            </p>
          )}
        </div>
      )}

      {/* Endereço resumido */}
      {(client.address_street || client.address_city) && (
        <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.28)' }}>
          📍 {[client.address_street, client.address_city].filter(Boolean).join(', ')}
        </p>
      )}

      {/* Ações */}
      <div
        className="flex items-center gap-1 pt-2 mt-auto border-t"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <ClientFormDialog
          unitId={unitId}
          client={client}
          trigger={
            <button
              className="text-xs px-2.5 py-1.5 rounded-lg transition-all duration-150"
              style={{ color: 'rgba(255,255,255,0.45)', background: 'transparent' }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)'
                ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)'
                ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              }}
            >
              Editar
            </button>
          }
        />
        <button
          disabled={isPending}
          onClick={() => onToggle(client)}
          className="text-xs px-2.5 py-1.5 rounded-lg transition-all duration-150 disabled:opacity-40"
          style={{ color: 'rgba(255,255,255,0.35)', background: 'transparent', marginLeft: 'auto' }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.65)'
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)'
            ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          }}
        >
          {client.active ? 'Desativar' : 'Ativar'}
        </button>
        <Link
          href={`/unit/${unitId}/clients/${client.id}`}
          className="text-xs px-2.5 py-1.5 rounded-lg transition-all duration-150"
          style={{ color: '#d6b25e', background: 'rgba(214,178,94,0.09)', borderRadius: 8 }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(214,178,94,0.16)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(214,178,94,0.09)')}
        >
          Ver →
        </Link>
      </div>
    </div>
  )
}
