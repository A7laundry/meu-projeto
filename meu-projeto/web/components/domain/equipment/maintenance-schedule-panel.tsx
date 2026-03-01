'use client'

import { useState, useTransition } from 'react'
import {
  createMaintenanceSchedule,
  markMaintenanceDone,
  type MaintenanceSchedule,
} from '@/actions/equipment/maintenance-schedule'

interface Props {
  unitId: string
  schedules: MaintenanceSchedule[]
  equipmentOptions: { id: string; name: string }[]
}

export function MaintenanceSchedulePanel({ unitId, schedules, equipmentOptions }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [equipmentId, setEquipmentId] = useState('')
  const [scheduleType, setScheduleType] = useState<'cycles' | 'days'>('days')
  const [interval, setInterval] = useState(30)
  const [description, setDescription] = useState('')

  function handleCreate() {
    setError(null)
    startTransition(async () => {
      const result = await createMaintenanceSchedule(unitId, {
        equipmentId,
        scheduleType,
        cycleInterval: scheduleType === 'cycles' ? interval : null,
        dayInterval: scheduleType === 'days' ? interval : null,
        description,
      })
      if (result.success) {
        setShowForm(false)
        setDescription('')
        setEquipmentId('')
      } else {
        setError(result.error)
      }
    })
  }

  function handleMarkDone(scheduleId: string) {
    startTransition(async () => {
      const result = await markMaintenanceDone(scheduleId, unitId)
      if (!result.success) setError(result.error)
    })
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 10,
    color: 'white',
    padding: '10px 12px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
  }

  return (
    <div className="card-dark rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/08 flex items-center justify-between">
        <h2 className="font-semibold text-white">Manutenção Preventiva</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm font-medium px-3 py-1.5 rounded-lg"
          style={{ color: '#60a5fa', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)' }}
        >
          {showForm ? 'Cancelar' : '+ Agendar'}
        </button>
      </div>

      {error && (
        <p
          className="text-sm px-5 py-2.5 mx-5 mt-3 rounded-lg"
          style={{ background: 'rgba(248,113,113,0.10)', color: '#fca5a5', border: '1px solid rgba(248,113,113,0.22)' }}
        >
          {error}
        </p>
      )}

      {showForm && (
        <div className="px-5 py-4 border-b border-white/08 space-y-3">
          <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} style={inputStyle}>
            <option value="" style={{ background: '#111' }}>Selecione o equipamento</option>
            {equipmentOptions.map((eq) => (
              <option key={eq.id} value={eq.id} style={{ background: '#111' }}>{eq.name}</option>
            ))}
          </select>
          <div className="flex gap-3">
            <select value={scheduleType} onChange={(e) => setScheduleType(e.target.value as 'cycles' | 'days')} style={{ ...inputStyle, flex: 1 }}>
              <option value="days" style={{ background: '#111' }}>Por dias</option>
              <option value="cycles" style={{ background: '#111' }}>Por ciclos</option>
            </select>
            <input
              type="number"
              min={1}
              value={interval}
              onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
              placeholder={scheduleType === 'days' ? 'Dias' : 'Ciclos'}
              style={{ ...inputStyle, width: 100, textAlign: 'center' }}
            />
          </div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição (ex: Troca de correia)"
            style={inputStyle}
          />
          <button
            onClick={handleCreate}
            disabled={isPending || !equipmentId || !description}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: 'white' }}
          >
            {isPending ? 'Salvando...' : 'Criar agendamento'}
          </button>
        </div>
      )}

      {schedules.length === 0 ? (
        <p className="px-5 py-8 text-sm text-white/30 italic text-center">
          Nenhum agendamento de manutenção preventiva.
        </p>
      ) : (
        <div className="divide-y divide-white/05">
          {schedules.map((s) => (
            <div key={s.id} className="px-5 py-3 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/90 truncate">
                  {s.equipment_name} — {s.description}
                </p>
                <p className="text-xs text-white/40 mt-0.5">
                  {s.schedule_type === 'days'
                    ? `A cada ${s.day_interval} dias`
                    : `A cada ${s.cycle_interval} ciclos`}
                  {s.last_maintenance_at && (
                    <> · Última: {new Date(s.last_maintenance_at).toLocaleDateString('pt-BR')}</>
                  )}
                </p>
              </div>
              <button
                onClick={() => handleMarkDone(s.id)}
                disabled={isPending}
                className="text-xs font-medium px-3 py-1.5 rounded-lg flex-shrink-0 disabled:opacity-40"
                style={{ color: '#34d399', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.20)' }}
              >
                Feita
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
