import Link from 'next/link'

const NAV_ITEMS = [
  { href: 'dashboard', label: '📊 Dashboard' },
  { href: 'alerts', label: '🚨 Alertas SLA' },
  { href: 'production', label: '🏭 Produção' },
  { href: 'equipment', label: '⚙️ Equipamentos' },
  { href: 'recipes', label: '📋 Receitas' },
  { href: 'supplies', label: '🧴 Insumos' },
  { href: 'staff', label: '👥 Funcionários' },
  { href: 'clients', label: '👤 Clientes' },
  { href: 'routes', label: '🗺️ Rotas' },
  { href: 'manifests', label: '📄 Romaneios' },
  { href: 'pricing', label: '💲 Preços' },
  { href: 'quotes', label: '📝 Orçamentos' },
  { href: 'financial', label: '💰 Financeiro' },
]

interface UnitSidebarProps {
  unitId: string
}

export function UnitSidebar({ unitId }: UnitSidebarProps) {
  return (
    <aside className="w-52 border-r bg-gray-50 py-4 px-3 flex-shrink-0">
      <nav className="space-y-1">
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={href}
            href={`/unit/${unitId}/${href}`}
            className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
