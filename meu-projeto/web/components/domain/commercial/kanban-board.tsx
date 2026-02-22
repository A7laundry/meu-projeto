'use client'

import { useState, useOptimistic, useTransition, useRef } from 'react'
import Link from 'next/link'
import { moveLeadStage } from '@/actions/commercial/leads'
import type { Lead, LeadStage } from '@/actions/commercial/leads'

const STAGES: LeadStage[] = ['prospect', 'contacted', 'qualified', 'proposal', 'won', 'lost']

const STAGE_LABELS: Record<LeadStage, string> = {
  prospect:  'Prospecto',
  contacted: 'Contatado',
  qualified: 'Qualificado',
  proposal:  'Proposta',
  won:       'Ganho',
  lost:      'Perdido',
}

const SOURCE_ICONS: Record<string, string> = {
  instagram: '📸',
  google:    '🔍',
  referral:  '🤝',
  cold_call: '📞',
  whatsapp:  '💬',
  form:      '📋',
  manual:    '✏️',
}

const STAGE_DARK: Record<LeadStage, { bg: string; text: string; border: string; headerBg: string }> = {
  prospect:  { bg: 'rgba(255,255,255,0.02)', text: 'rgba(255,255,255,0.40)',  border: 'rgba(255,255,255,0.07)',  headerBg: 'rgba(255,255,255,0.04)'  },
  contacted: { bg: 'rgba(96,165,250,0.04)',  text: 'rgba(96,165,250,0.80)',   border: 'rgba(96,165,250,0.12)',   headerBg: 'rgba(96,165,250,0.08)'   },
  qualified: { bg: 'rgba(167,139,250,0.04)', text: 'rgba(167,139,250,0.80)',  border: 'rgba(167,139,250,0.12)',  headerBg: 'rgba(167,139,250,0.08)'  },
  proposal:  { bg: 'rgba(214,178,94,0.04)',  text: 'rgba(214,178,94,0.90)',   border: 'rgba(214,178,94,0.14)',   headerBg: 'rgba(214,178,94,0.09)'   },
  won:       { bg: 'rgba(52,211,153,0.04)',  text: 'rgba(52,211,153,0.85)',   border: 'rgba(52,211,153,0.12)',   headerBg: 'rgba(52,211,153,0.08)'   },
  lost:      { bg: 'rgba(248,113,113,0.04)', text: 'rgba(248,113,113,0.70)',  border: 'rgba(248,113,113,0.10)',  headerBg: 'rgba(248,113,113,0.07)'  },
}

interface KanbanBoardProps {
  initialLeads: Lead[]
}

export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
  const [optimisticLeads, moveOptimistic] = useOptimistic(
    initialLeads,
    (state, { leadId, stage }: { leadId: string; stage: LeadStage }) =>
      state.map(l => l.id === leadId ? { ...l, stage } : l),
  )

  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [overStage, setOverStage]  = useState<LeadStage | null>(null)
  const [, startTransition]        = useTransition()
  const didDragRef                 = useRef(false)

  function handleDragStart(e: React.DragEvent, leadId: string) {
    didDragRef.current = true
    setDraggedId(leadId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, stage: LeadStage) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (overStage !== stage) setOverStage(stage)
  }

  function handleDragLeave(e: React.DragEvent) {
    const related = e.relatedTarget as HTMLElement | null
    if (!related || !(e.currentTarget as HTMLElement).contains(related)) {
      setOverStage(null)
    }
  }

  function handleDrop(e: React.DragEvent, stage: LeadStage) {
    e.preventDefault()
    setOverStage(null)
    const id = draggedId
    setDraggedId(null)
    if (!id) return

    const lead = optimisticLeads.find(l => l.id === id)
    if (!lead || lead.stage === stage) return

    startTransition(async () => {
      moveOptimistic({ leadId: id, stage })
      await moveLeadStage(id, stage)
    })
  }

  function handleDragEnd() {
    setDraggedId(null)
    setOverStage(null)
    setTimeout(() => { didDragRef.current = false }, 100)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start">
      {STAGES.map((stage) => {
        const filtered   = optimisticLeads.filter(l => l.stage === stage)
        const totalValue = filtered.reduce((s, l) => s + Number(l.estimated_monthly_value ?? 0), 0)
        const theme      = STAGE_DARK[stage]
        const isOver     = overStage === stage

        return (
          <div
            key={stage}
            className="flex-shrink-0 w-64 flex flex-col gap-2"
            onDragOver={e => handleDragOver(e, stage)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, stage)}
          >
            {/* Cabeçalho da coluna */}
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
              style={{
                background: theme.headerBg,
                border: isOver ? `2px solid ${theme.text}` : `1px solid ${theme.border}`,
              }}
            >
              <span className="text-xs font-semibold" style={{ color: theme.text }}>
                {STAGE_LABELS[stage]}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] font-bold tabular-nums w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}
                >
                  {filtered.length}
                </span>
                {totalValue > 0 && (
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.30)' }}>
                    R${(totalValue / 1000).toFixed(1)}k
                  </span>
                )}
              </div>
            </div>

            {/* Drop zone */}
            <div
              className="flex flex-col gap-2 min-h-[80px] rounded-xl transition-all"
              style={{
                background: isOver ? theme.bg : 'transparent',
                border: isOver
                  ? `1px dashed ${theme.text}`
                  : '1px solid transparent',
                padding: isOver ? '4px' : '0',
              }}
            >
              {filtered.length === 0 && (
                <div
                  className="rounded-xl px-3 py-6 text-center"
                  style={{
                    background: isOver ? 'transparent' : 'rgba(255,255,255,0.01)',
                    border:     isOver ? 'none'         : '1px dashed rgba(255,255,255,0.06)',
                  }}
                >
                  <p className="text-[11px]" style={{ color: isOver ? theme.text : 'rgba(255,255,255,0.20)' }}>
                    {isOver ? '↓ Soltar aqui' : 'vazio'}
                  </p>
                </div>
              )}

              {filtered.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={e => handleDragStart(e, lead.id)}
                  onDragEnd={handleDragEnd}
                  className="rounded-xl p-3.5 transition-all duration-150 group select-none"
                  style={{
                    background: draggedId === lead.id ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${draggedId === lead.id ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`,
                    opacity:   draggedId === lead.id ? 0.45 : 1,
                    cursor:    draggedId === lead.id ? 'grabbing' : 'grab',
                    transform: draggedId === lead.id ? 'scale(0.97) rotate(1deg)' : 'scale(1)',
                  }}
                >
                  <Link
                    href={`/commercial/leads/${lead.id}`}
                    onClick={e => { if (didDragRef.current) e.preventDefault() }}
                    style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', display: 'block' }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold truncate text-white/85 group-hover:text-white transition-colors">
                        {lead.name}
                      </p>
                      {Number(lead.estimated_monthly_value) > 0 && (
                        <span className="text-[11px] flex-shrink-0 tabular-nums" style={{ color: '#d6b25e', fontWeight: 600 }}>
                          R${Number(lead.estimated_monthly_value).toFixed(0)}
                        </span>
                      )}
                    </div>
                    {lead.company && (
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {lead.company}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                      {lead.source && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border:     '1px solid rgba(255,255,255,0.08)',
                            color:      'rgba(255,255,255,0.40)',
                          }}
                        >
                          {SOURCE_ICONS[lead.source] ?? '📌'} {lead.source}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.28)' }}>
                          {lead.phone}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
