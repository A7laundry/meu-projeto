import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/director/dashboard', label: '📊 Dashboard Geral' },
  { href: '/director/units', label: '🏢 Unidades' },
]

export function DirectorSidebar() {
  return (
    <aside className="w-52 border-r bg-gray-50 py-4 px-3 flex-shrink-0">
      <nav className="space-y-1">
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
