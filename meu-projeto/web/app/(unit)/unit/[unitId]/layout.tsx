import { getUnit } from '@/actions/units/crud'
import { getUser } from '@/lib/auth/get-user'
import { AppHeader } from '@/components/layout/app-header'
import { UnitSidebar } from '@/components/layout/unit-sidebar'

export default async function UnitLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const [unit, user] = await Promise.all([getUnit(unitId), getUser()])

  return (
    <div className="min-h-screen flex flex-col bg-obsidian">
      <AppHeader
        user={user}
        title="A7x TecNologia - OS."
        subtitle={unit?.name ?? 'Unidade'}
        logoHref="/director/dashboard"
        dark
      />
      <div className="flex flex-1">
        <UnitSidebar unitId={unitId} />
        <main className="flex-1 overflow-auto bg-obsidian scrollbar-dark">{children}</main>
      </div>
    </div>
  )
}
