import Link from 'next/link'
import { listEquipment } from '@/actions/equipment/crud'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EquipmentFormDialog } from '@/components/domain/equipment/equipment-form-dialog'
import {
  EQUIPMENT_TYPE_LABELS,
  EQUIPMENT_STATUS_LABELS,
  type EquipmentStatus,
} from '@/types/equipment'

const STATUS_VARIANT: Record<EquipmentStatus, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  maintenance: 'secondary',
  inactive: 'destructive',
}

export default async function EquipmentPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const equipment = await listEquipment(unitId)

  const byType = {
    washer: equipment.filter(e => e.type === 'washer').length,
    dryer:  equipment.filter(e => e.type === 'dryer').length,
    iron:   equipment.filter(e => e.type === 'iron').length,
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Equipamentos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {byType.washer} lavadoras · {byType.dryer} secadoras · {byType.iron} passadeiras
          </p>
        </div>
        <EquipmentFormDialog unitId={unitId} mode="create" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Marca / Modelo</TableHead>
              <TableHead>Cap. (kg)</TableHead>
              <TableHead>N° Série</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-12">
                  Nenhum equipamento cadastrado. Adicione a primeira máquina.
                </TableCell>
              </TableRow>
            )}
            {equipment.map((eq) => (
              <TableRow key={eq.id} className={eq.status === 'inactive' ? 'opacity-50' : ''}>
                <TableCell className="font-medium">
                  <Link
                    href={`/unit/${unitId}/equipment/${eq.id}`}
                    className="hover:underline text-blue-600"
                  >
                    {eq.name}
                  </Link>
                </TableCell>
                <TableCell>{EQUIPMENT_TYPE_LABELS[eq.type]}</TableCell>
                <TableCell className="text-gray-500">
                  {[eq.brand, eq.model].filter(Boolean).join(' · ') || '—'}
                </TableCell>
                <TableCell>{eq.capacity_kg ? `${eq.capacity_kg} kg` : '—'}</TableCell>
                <TableCell className="font-mono text-xs text-gray-500">
                  {eq.serial_number ?? '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[eq.status]}>
                    {EQUIPMENT_STATUS_LABELS[eq.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/unit/${unitId}/equipment/${eq.id}`}>Diário</Link>
                    </Button>
                    <EquipmentFormDialog unitId={unitId} mode="edit" equipment={eq} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
