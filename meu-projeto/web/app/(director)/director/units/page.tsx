import Link from 'next/link'
import { listUnits } from '@/actions/units/crud'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UnitFormDialog } from '@/components/domain/unit/unit-form-dialog'
import { UnitToggleButton } from '@/components/domain/unit/unit-toggle-button'

export default async function UnitsPage() {
  const units = await listUnits()

  const active = units.filter(u => u.active).length
  const inactive = units.filter(u => !u.active).length

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Unidades da Rede</h1>
          <p className="text-sm text-gray-500 mt-1">
            {active} ativas · {inactive} inativas · {units.length} total
          </p>
        </div>
        <UnitFormDialog mode="create" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>UF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-12">
                  Nenhuma unidade cadastrada. Execute o seed ou crie a primeira unidade.
                </TableCell>
              </TableRow>
            )}
            {units.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell className="font-medium">{unit.name}</TableCell>
                <TableCell className="text-gray-500 font-mono text-sm">{unit.slug}</TableCell>
                <TableCell>{unit.city}</TableCell>
                <TableCell>{unit.state}</TableCell>
                <TableCell>{unit.phone ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={unit.active ? 'default' : 'secondary'}>
                    {unit.active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <UnitFormDialog mode="edit" unit={unit} />
                    <UnitToggleButton id={unit.id} active={unit.active} />
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/unit/${unit.id}/dashboard`}
                    className="inline-flex items-center gap-1 text-xs bg-gray-900 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md transition-colors whitespace-nowrap"
                  >
                    Acessar Painel →
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
