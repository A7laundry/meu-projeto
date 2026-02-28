'use client'

import { useState, useTransition } from 'react'
import { completeSector, type SectorCompletionData } from '@/actions/production/complete-sector'
import { createMaintenanceRequest } from '@/actions/production/maintenance-request'
import type { Order } from '@/types/order'
import type { Equipment } from '@/types/equipment'
import type { Recipe } from '@/types/recipe'
import type { WashingKpis } from '@/actions/production/washing-kpis'

interface WashingFormProps {
  order: Order
  unitId: string
  operatorId: string
  equipment: Equipment[]
  recipes: Recipe[]
  kpis: WashingKpis
  onComplete: () => void
  onCancel: () => void
}

const cardStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14,
  padding: '18px',
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 10,
  color: 'white',
  padding: '12px 14px',
  fontSize: 16,
  width: '100%',
  outline: 'none',
}

export function WashingForm({
  order,
  unitId,
  operatorId,
  equipment,
  recipes,
  kpis,
  onComplete,
  onCancel,
}: WashingFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isMaintPending, startMaintTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [maintError, setMaintError] = useState<string | null>(null)
  const [maintSuccess, setMaintSuccess] = useState(false)

  const [startedAt] = useState(() => new Date().toISOString())
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('')
  const [selectedRecipeId, setSelectedRecipeId] = useState('')
  const [cycles, setCycles] = useState(1)
  const [weightKg, setWeightKg] = useState('')
  const [notes, setNotes] = useState('')

  const [showMaintenance, setShowMaintenance] = useState(false)
  const [maintDescription, setMaintDescription] = useState('')
  const [maintUrgency, setMaintUrgency] = useState<'low' | 'medium' | 'high'>('medium')

  const totalPieces = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0

  function handleSubmit() {
    setError(null)
    const data: SectorCompletionData = {
      sectorKey: 'washing',
      orderId: order.id,
      unitId,
      equipmentId: selectedEquipmentId || undefined,
      recipeId: selectedRecipeId || undefined,
      cycles,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      startedAt,
      notes: notes || undefined,
    }
    startTransition(async () => {
      const result = await completeSector(data)
      if (result.success) onComplete()
      else setError(result.error)
    })
  }

  function handleMaintSubmit() {
    if (!maintDescription.trim()) {
      setMaintError('Descreva o problema.')
      return
    }
    setMaintError(null)
    startMaintTransition(async () => {
      const result = await createMaintenanceRequest(unitId, {
        equipmentId: selectedEquipmentId || null,
        description: maintDescription,
        urgency: maintUrgency,
      })
      if (result.success) {
        setMaintSuccess(true)
        setMaintDescription('')
        setTimeout(() => {
          setShowMaintenance(false)
          setMaintSuccess(false)
        }, 2000)
      } else {
        setMaintError(result.error)
      }
    })
  }

  const urgencyConfig = {
    low: { label: 'Baixa', color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)' },
    medium: { label: 'Média', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)' },
    high: { label: 'Alta', color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)' },
  }

  return (
    <div
      className="flex flex-col h-full text-white relative"
      style={{ background: 'linear-gradient(180deg, #060609 0%, #07070a 100%)' }}
    >
      {/* Modal de Manutenção */}
      {showMaintenance && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="w-full max-w-md m-4 rounded-2xl p-6 space-y-4"
            style={{
              background: 'linear-gradient(160deg, rgba(214,178,94,0.06) 0%, rgba(5,5,8,0.97) 100%)',
              border: '1px solid rgba(214,178,94,0.18)',
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">🔧 Solicitar Manutenção</h3>
              <button
                onClick={() => setShowMaintenance(false)}
                className="text-white/30 hover:text-white/70 text-sm"
              >
                ✕
              </button>
            </div>

            {selectedEquipmentId && (
              <p className="text-xs text-white/40">
                Equipamento: <span className="text-white/70">{equipment.find(e => e.id === selectedEquipmentId)?.name ?? '—'}</span>
              </p>
            )}

            <div>
              <label className="text-xs text-white/40 block mb-1.5">Descreva o problema</label>
              <textarea
                value={maintDescription}
                onChange={(e) => setMaintDescription(e.target.value)}
                style={{ ...inputStyle, resize: 'none', fontSize: 14 }}
                rows={3}
                placeholder="Ex: Máquina vazando, barulho anormal, erro de código..."
              />
            </div>

            <div>
              <label className="text-xs text-white/40 block mb-2">Urgência</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((u) => {
                  const uc = urgencyConfig[u]
                  return (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setMaintUrgency(u)}
                      className="py-3 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: maintUrgency === u ? uc.bg : 'rgba(255,255,255,0.04)',
                        border: `2px solid ${maintUrgency === u ? uc.border : 'rgba(255,255,255,0.08)'}`,
                        color: maintUrgency === u ? uc.color : 'rgba(255,255,255,0.40)',
                      }}
                    >
                      {uc.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {maintError && (
              <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{maintError}</p>
            )}

            {maintSuccess ? (
              <div
                className="text-center py-3 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(52,211,153,0.14)', color: '#34d399', border: '1px solid rgba(52,211,153,0.28)' }}
              >
                ✓ Solicitação registrada!
              </div>
            ) : (
              <button
                onClick={handleMaintSubmit}
                disabled={isMaintPending}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                style={{
                  background: 'rgba(214,178,94,0.15)',
                  border: '1px solid rgba(214,178,94,0.30)',
                  color: '#d6b25e',
                }}
              >
                {isMaintPending ? 'Registrando...' : '📋 Registrar Solicitação'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div>
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: '#60a5fa' }}>
            Lavagem
          </p>
          <h2 className="text-2xl font-black font-mono tracking-tight" style={{ color: '#60a5fa' }}>
            {order.order_number}
          </h2>
          <p className="text-sm text-white/55 mt-0.5">
            {order.client_name} · {totalPieces} peça{totalPieces !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-sm text-white/30 hover:text-white/65 transition-colors flex items-center gap-1"
        >
          ← Voltar
        </button>
      </div>

      {/* KPI Strip */}
      <div
        className="px-5 py-3 flex gap-2 overflow-x-auto flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        {[
          { icon: '🔄', label: 'Comandas', value: String(kpis.ordersWashed) },
          { icon: '🔃', label: 'Ciclos', value: String(kpis.totalCycles) },
          { icon: '⏱', label: 'Tempo', value: `${kpis.workTimeMinutes}min` },
          { icon: '🧪', label: 'Químicos', value: `${kpis.litersConsumed}L` },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="flex-shrink-0 flex flex-col items-center px-4 py-2 rounded-xl"
            style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.12)' }}
          >
            <span className="text-base leading-none">{kpi.icon}</span>
            <span className="text-[11px] font-bold text-white mt-1">{kpi.value}</span>
            <span className="text-[9px] text-white/30 uppercase tracking-wide mt-0.5">{kpi.label}</span>
          </div>
        ))}
        <div className="flex-1 text-xs text-white/20 self-center pl-1">hoje</div>
      </div>

      {/* Campos */}
      <div className="flex-1 overflow-auto p-5 space-y-4">

        {/* Equipamento */}
        <div style={cardStyle}>
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-3">
            Equipamento (Lavadora)
          </p>
          {equipment.length === 0 ? (
            <p className="text-sm text-white/30">Nenhuma lavadora ativa cadastrada.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {equipment.map((eq) => {
                const isSelected = selectedEquipmentId === eq.id
                return (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => setSelectedEquipmentId(isSelected ? '' : eq.id)}
                    className="py-4 px-3 rounded-xl text-left transition-all"
                    style={{
                      background: isSelected ? 'rgba(96,165,250,0.14)' : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${isSelected ? 'rgba(96,165,250,0.40)' : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    <p
                      className="text-sm font-semibold"
                      style={{ color: isSelected ? '#60a5fa' : 'rgba(255,255,255,0.70)' }}
                    >
                      {eq.name}
                    </p>
                    {eq.capacity_kg && (
                      <p className="text-xs mt-0.5" style={{ color: isSelected ? 'rgba(96,165,250,0.70)' : 'rgba(255,255,255,0.30)' }}>
                        {eq.capacity_kg} kg
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Receita */}
        <div style={cardStyle}>
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-3">
            Receita de Lavagem
          </p>
          <select
            value={selectedRecipeId}
            onChange={(e) => setSelectedRecipeId(e.target.value)}
            style={{ ...inputStyle, fontSize: 14 }}
          >
            <option value="">Sem receita específica</option>
            {recipes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
                {r.duration_minutes ? ` · ${r.duration_minutes}min` : ''}
                {r.temperature_celsius ? ` · ${r.temperature_celsius}°C` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Ciclos + Peso */}
        <div style={cardStyle}>
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-3">
            Ciclos & Peso
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 block mb-1.5">Ciclos realizados</label>
              <input
                type="number"
                min={1}
                value={cycles}
                onChange={(e) => setCycles(Math.max(1, Number(e.target.value)))}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1.5">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                min={0}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="Opcional"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="text-xs text-white/35 mb-1.5 block uppercase tracking-wide">Observações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ ...inputStyle, resize: 'none', fontSize: 14 }}
            rows={2}
            placeholder="Observações opcionais..."
          />
        </div>

        {/* Botão manutenção */}
        <button
          type="button"
          onClick={() => setShowMaintenance(true)}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'rgba(251,191,36,0.06)',
            border: '1px solid rgba(251,191,36,0.15)',
            color: 'rgba(251,191,36,0.70)',
          }}
        >
          🔧 Solicitar Manutenção
        </button>
      </div>

      {/* Footer */}
      <div
        className="px-5 py-4 space-y-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {error && (
          <p
            className="text-sm rounded-xl px-4 py-2.5"
            style={{ background: 'rgba(248,113,113,0.10)', color: '#fca5a5', border: '1px solid rgba(248,113,113,0.22)' }}
          >
            {error}
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full h-14 text-base font-bold rounded-xl transition-all disabled:opacity-50"
          style={{
            background: isPending
              ? 'rgba(255,255,255,0.08)'
              : 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
            color: 'white',
            border: '1px solid rgba(96,165,250,0.40)',
            boxShadow: isPending ? 'none' : '0 0 24px rgba(96,165,250,0.18)',
          }}
        >
          {isPending ? 'Registrando...' : '✓ Concluir Lavagem → Secagem'}
        </button>
      </div>
    </div>
  )
}
