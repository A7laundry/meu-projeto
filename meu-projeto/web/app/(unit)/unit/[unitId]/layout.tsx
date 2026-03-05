import { getUnit } from '@/actions/units/crud'
import { getUser } from '@/lib/auth/get-user'
import { logout } from '@/app/(auth)/login/actions'
import { UnitShell } from './unit-shell'

const ROLE_LABELS: Record<string, string> = {
  director: 'Diretor',
  unit_manager: 'Gerente',
  operator: 'Operador',
  driver: 'Motorista',
}

export default async function UnitLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const [unit, user] = await Promise.all([getUnit(unitId), getUser()])

  const unitName = unit?.name ?? 'Unidade'
  const userRole = user?.role ? (ROLE_LABELS[user.role] ?? user.role) : undefined

  return (
    <UnitShell
      unitId={unitId}
      unitName={unitName}
      userName={user?.full_name}
      userRole={userRole}
      logoutAction={logout}
    >
      {children}
    </UnitShell>
  )
}
