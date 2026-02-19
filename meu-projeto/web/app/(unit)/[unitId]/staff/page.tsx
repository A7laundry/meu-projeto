import { listStaff, toggleStaffStatus } from '@/actions/staff/invite'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StaffInviteDialog } from '@/components/domain/staff/staff-invite-dialog'

const ROLE_LABELS: Record<string, string> = {
  director: 'Diretor',
  unit_manager: 'Gerente',
  operator: 'Operador',
  driver: 'Motorista',
  store: 'Loja',
  customer: 'Cliente',
}

const SECTOR_LABELS: Record<string, string> = {
  sorting: 'Triagem',
  washing: 'Lavagem',
  drying: 'Secagem',
  ironing: 'Passadoria',
  shipping: 'Expedição',
}

export default async function StaffPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const staff = await listStaff(unitId)

  const active = staff.filter(s => s.active).length

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Funcionários</h1>
          <p className="text-sm text-gray-500 mt-1">{active} ativos · {staff.length} total</p>
        </div>
        <StaffInviteDialog unitId={unitId} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400 py-12">
                  Nenhum funcionário cadastrado. Convide o primeiro funcionário.
                </TableCell>
              </TableRow>
            )}
            {staff.map((member) => (
              <TableRow key={member.id} className={!member.active ? 'opacity-50' : ''}>
                <TableCell className="font-medium">{member.full_name}</TableCell>
                <TableCell>{ROLE_LABELS[member.role] ?? member.role}</TableCell>
                <TableCell>{member.sector ? SECTOR_LABELS[member.sector] ?? member.sector : '—'}</TableCell>
                <TableCell>
                  <Badge variant={member.active ? 'default' : 'secondary'}>
                    {member.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <form action={async () => {
                    'use server'
                    await toggleStaffStatus(member.id, unitId, !member.active)
                  }}>
                    <button
                      type="submit"
                      className={`text-sm ${member.active ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}
                    >
                      {member.active ? 'Desativar' : 'Ativar'}
                    </button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
