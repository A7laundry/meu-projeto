'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createEquipmentLog } from '@/actions/equipment/logs'
import { EQUIPMENT_LOG_TYPE_LABELS } from '@/types/equipment-log'

const LOG_TYPES = Object.entries(EQUIPMENT_LOG_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

interface EquipmentLogFormProps {
  equipmentId: string
  unitId: string
  operatorName: string | null
  onSuccess?: () => void
}

export function EquipmentLogForm({
  equipmentId,
  unitId,
  operatorName,
  onSuccess,
}: EquipmentLogFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logType, setLogType] = useState('use')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createEquipmentLog(equipmentId, unitId, formData, operatorName)

    setLoading(false)
    if (!result.success) { setError(result.error); return }
    ;(e.target as HTMLFormElement).reset()
    setLogType('use')
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-xl border">
      <h3 className="font-semibold text-sm text-gray-700">Registrar no Diário</h3>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="log_type">Tipo de registro *</Label>
          <select
            id="log_type"
            name="log_type"
            value={logType}
            onChange={(e) => setLogType(e.target.value)}
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {LOG_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {logType === 'use' && (
          <div className="space-y-1">
            <Label htmlFor="cycles">Ciclos realizados</Label>
            <Input id="cycles" name="cycles" type="number" min={1} placeholder="Ex: 3" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="notes">Observações</Label>
        <Input
          id="notes"
          name="notes"
          placeholder={
            logType === 'incident'
              ? 'Descreva o problema...'
              : logType === 'maintenance'
              ? 'Serviço executado...'
              : 'Observações opcionais'
          }
        />
      </div>

      <Button type="submit" disabled={loading} size="sm">
        {loading ? 'Registrando...' : 'Registrar'}
      </Button>
    </form>
  )
}
