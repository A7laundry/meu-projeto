import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/get-user'
import { listEquipmentLogs, getTotalCycles } from '@/actions/equipment/logs'
import { EquipmentLogForm } from '@/components/domain/equipment/equipment-log-form'
import { EquipmentLogList } from '@/components/domain/equipment/equipment-log-list'
import { Badge } from '@/components/ui/badge'
import { EQUIPMENT_TYPE_LABELS, EQUIPMENT_STATUS_LABELS, type EquipmentStatus } from '@/types/equipment'
import Link from 'next/link'

export const revalidate = 0

const STATUS_VARIANT: Record<EquipmentStatus, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  maintenance: 'secondary',
  inactive: 'destructive',
}

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ unitId: string; equipmentId: string }>
}) {
  const { unitId, equipmentId } = await params
  const user = await requireUser()

  const supabase = await createClient()
  const { data: equipment } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', equipmentId)
    .eq('unit_id', unitId)
    .single()

  if (!equipment) notFound()

  const [logs, totalCycles] = await Promise.all([
    listEquipmentLogs(equipmentId),
    getTotalCycles(equipmentId),
  ])

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        <Link href={`/unit/${unitId}/equipment`} className="hover:underline">
          Equipamentos
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{equipment.name}</span>
      </div>

      {/* Header do equipamento */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{equipment.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {EQUIPMENT_TYPE_LABELS[equipment.type as keyof typeof EQUIPMENT_TYPE_LABELS]}
            {equipment.brand ? ` · ${equipment.brand}` : ''}
            {equipment.model ? ` ${equipment.model}` : ''}
            {equipment.capacity_kg ? ` · ${equipment.capacity_kg} kg` : ''}
          </p>
        </div>
        <Badge variant={STATUS_VARIANT[equipment.status as EquipmentStatus]}>
          {EQUIPMENT_STATUS_LABELS[equipment.status as EquipmentStatus]}
        </Badge>
      </div>

      {/* Contador de ciclos */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Total de ciclos</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalCycles.toLocaleString('pt-BR')}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Registros no diário</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{logs.length}</p>
        </div>
      </div>

      {/* Formulário de novo registro */}
      <EquipmentLogForm
        equipmentId={equipmentId}
        unitId={unitId}
        operatorName={user.full_name}
      />

      {/* Histórico */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Histórico de registros</h2>
        <EquipmentLogList logs={logs} />
      </div>
    </div>
  )
}
