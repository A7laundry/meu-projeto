'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { BehaviorCampaignData, CampaignClient } from '@/actions/commercial/campaigns'
import { buildBirthdayMessage, buildDormancyMessage, buildWhatsAppUrl } from '@/lib/campaigns/messages'

type SegmentKey = 'birthday' | 'dormant30' | 'dormant60' | 'dormant90'

interface CampaignPanelProps {
  data: BehaviorCampaignData
}

const SEGMENTS: Array<{
  key: SegmentKey
  icon: string
  label: string
  sublabel: string
  color: string
  borderColor: string
  badgeColor: string
}> = [
  {
    key: 'birthday',
    icon: '🎂',
    label: 'Aniversariantes',
    sublabel: 'Este mês',
    color: 'rgba(214,178,94,0.12)',
    borderColor: 'rgba(214,178,94,0.30)',
    badgeColor: '#d6b25e',
  },
  {
    key: 'dormant30',
    icon: '⏰',
    label: 'Inativos 30 dias',
    sublabel: 'Em risco',
    color: 'rgba(251,191,36,0.08)',
    borderColor: 'rgba(251,191,36,0.25)',
    badgeColor: '#fbbf24',
  },
  {
    key: 'dormant60',
    icon: '⚠️',
    label: 'Inativos 60 dias',
    sublabel: 'Dormentes',
    color: 'rgba(251,146,60,0.08)',
    borderColor: 'rgba(251,146,60,0.25)',
    badgeColor: '#fb923c',
  },
  {
    key: 'dormant90',
    icon: '🔴',
    label: 'Inativos 90+ dias',
    sublabel: 'Perdidos',
    color: 'rgba(248,113,113,0.08)',
    borderColor: 'rgba(248,113,113,0.25)',
    badgeColor: '#f87171',
  },
]

export function CampaignPanel({ data }: CampaignPanelProps) {
  const [activeSegment, setActiveSegment] = useState<SegmentKey>('birthday')

  const counts: Record<SegmentKey, number> = {
    birthday:  data.birthday.length,
    dormant30: data.dormant30.length,
    dormant60: data.dormant60.length,
    dormant90: data.dormant90.length,
  }

  const clients = data[activeSegment]
  const segment = SEGMENTS.find(s => s.key === activeSegment)!
  const todayBirthdays = data.birthday.filter(c => c.birthday_today).length

  return (
    <div className="space-y-6">

      {/* ── Cards de resumo ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SEGMENTS.map((seg) => {
          const count = counts[seg.key]
          const isActive = activeSegment === seg.key
          return (
            <button
              key={seg.key}
              onClick={() => setActiveSegment(seg.key)}
              className="rounded-xl p-4 text-left transition-all duration-200"
              style={{
                background: isActive ? seg.color : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isActive ? seg.borderColor : 'rgba(255,255,255,0.06)'}`,
                transform: isActive ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{seg.icon}</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: isActive ? `${seg.badgeColor}22` : 'rgba(255,255,255,0.06)',
                    color: isActive ? seg.badgeColor : 'rgba(255,255,255,0.35)',
                    border: `1px solid ${isActive ? `${seg.badgeColor}44` : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  {count}
                </span>
              </div>
              <p className="text-sm font-semibold" style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.50)' }}>
                {seg.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: isActive ? seg.badgeColor : 'rgba(255,255,255,0.25)' }}>
                {seg.key === 'birthday' && todayBirthdays > 0
                  ? `${todayBirthdays} hoje!`
                  : seg.sublabel}
              </p>
            </button>
          )
        })}
      </div>

      {/* ── Painel do segmento ─────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Header do painel */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            background: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{segment.icon}</span>
            <div>
              <p className="text-sm font-semibold text-white">{segment.label}</p>
              <p className="text-xs text-white/35">
                {clients.length === 0
                  ? 'Nenhum cliente neste segmento'
                  : `${clients.length} cliente${clients.length !== 1 ? 's' : ''} · clique em WhatsApp para disparar`}
              </p>
            </div>
          </div>

          {clients.length > 0 && (
            <DispatchAllButton clients={clients} segmentKey={activeSegment} />
          )}
        </div>

        {/* Lista de clientes */}
        {clients.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">✨</p>
            <p className="text-white/40 text-sm font-medium">Nenhum cliente neste segmento</p>
            <p className="text-white/20 text-xs mt-1">
              {activeSegment === 'birthday'
                ? 'Nenhum aniversariante este mês — tente checar o mês que vem!'
                : 'Seus clientes estão ativos. Continue o bom trabalho!'}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {clients.map((client) => (
              <ClientRow key={client.id} client={client} segmentKey={activeSegment} />
            ))}
          </div>
        )}
      </div>

      {/* Dica */}
      <p className="text-xs text-white/20 text-center">
        As mensagens são personalizadas automaticamente com o nome do cliente.
        Clique em &quot;WhatsApp&quot; para abrir a conversa com o texto pronto.
      </p>
    </div>
  )
}

// ─── Linha de cliente ────────────────────────────────────────

function ClientRow({ client, segmentKey }: { client: CampaignClient; segmentKey: SegmentKey }) {
  const initials = client.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const hasPhone = Boolean(client.phone)

  const message = segmentKey === 'birthday'
    ? buildBirthdayMessage(client.name)
    : buildDormancyMessage(client.name, client.days_inactive)

  const wppUrl = client.phone ? buildWhatsAppUrl(client.phone, message) : null

  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold"
        style={{
          background: client.birthday_today
            ? 'rgba(214,178,94,0.18)'
            : 'rgba(255,255,255,0.05)',
          border: client.birthday_today
            ? '1px solid rgba(214,178,94,0.35)'
            : '1px solid rgba(255,255,255,0.08)',
          color: client.birthday_today ? '#d6b25e' : 'rgba(255,255,255,0.40)',
        }}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-white/85 truncate">{client.name}</p>
          {client.birthday_today && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
              style={{ background: 'rgba(214,178,94,0.18)', color: '#d6b25e', border: '1px solid rgba(214,178,94,0.35)' }}
            >
              🎂 Hoje!
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {client.phone ? (
            <span className="text-xs text-white/35">📞 {client.phone}</span>
          ) : (
            <span className="text-xs text-white/20 italic">Sem telefone</span>
          )}

          {segmentKey === 'birthday' && client.birthday_formatted && (
            <span className="text-xs text-white/30">🎂 {client.birthday_formatted}</span>
          )}

          {segmentKey !== 'birthday' && (
            <span className="text-xs text-white/30">
              {client.last_order_at
                ? `último pedido ${format(parseISO(client.last_order_at), "dd/MM/yy", { locale: ptBR })}`
                : 'nunca pediu'}
              {' · '}
              <span style={{ color: client.days_inactive >= 90 ? '#f87171' : client.days_inactive >= 60 ? '#fb923c' : '#fbbf24' }}>
                {client.days_inactive}d inativo
              </span>
            </span>
          )}

          {client.total_orders > 0 && (
            <span className="text-xs text-white/25">
              {client.total_orders} comanda{client.total_orders !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Botão WPP */}
      {hasPhone && wppUrl ? (
        <a
          href={wppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: 'rgba(37,211,102,0.12)',
            border: '1px solid rgba(37,211,102,0.28)',
            color: '#25d366',
          }}
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </a>
      ) : (
        <span className="flex-shrink-0 text-xs text-white/15 px-3 py-1.5">sem telefone</span>
      )}
    </div>
  )
}

// ─── Botão "Disparar para todos" ─────────────────────────────

function DispatchAllButton({ clients, segmentKey }: { clients: CampaignClient[]; segmentKey: SegmentKey }) {
  const withPhone = clients.filter(c => c.phone)

  function handleDispatchAll() {
    // Abre até 10 janelas WPP de uma vez (limite seguro para browsers)
    const toSend = withPhone.slice(0, 10)
    toSend.forEach((client, i) => {
      const message = segmentKey === 'birthday'
        ? buildBirthdayMessage(client.name)
        : buildDormancyMessage(client.name, client.days_inactive)
      const url = buildWhatsAppUrl(client.phone!, message)
      setTimeout(() => window.open(url, '_blank'), i * 300)
    })
    if (withPhone.length > 10) {
      alert(`Abrindo primeiros 10 de ${withPhone.length} clientes. Para os demais, dispare individualmente.`)
    }
  }

  if (withPhone.length === 0) return null

  return (
    <button
      onClick={handleDispatchAll}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={{
        background: 'rgba(37,211,102,0.08)',
        border: '1px solid rgba(37,211,102,0.20)',
        color: 'rgba(37,211,102,0.8)',
      }}
    >
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      Disparar para {withPhone.length} {withPhone.length !== 1 ? 'clientes' : 'cliente'}
    </button>
  )
}
