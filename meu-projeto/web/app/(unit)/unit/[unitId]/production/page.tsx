import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getPackagingReport, getPackagingLabel } from '@/actions/production/packaging-report'

export default async function ProductionPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const packagingReport = await getPackagingReport(unitId, 30)
  const totalPkg = packagingReport.reduce((s, r) => s + r.total_quantity, 0)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Produção</h1>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/unit/${unitId}/production/orders`}>Ver Comandas</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/unit/${unitId}/production/orders/new`}>Nova Comanda</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/unit/${unitId}/production/history`}>Histórico</Link>
        </Button>
      </div>

      {/* Relatório de embalagens — últimos 30 dias */}
      <div className="card-dark rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/08">
          <h2 className="font-semibold text-white">Embalagens — Últimos 30 dias</h2>
          <p className="text-xs text-white/40 mt-0.5">{totalPkg} unidades consumidas</p>
        </div>
        {packagingReport.length === 0 ? (
          <p className="px-5 py-6 text-sm text-white/30 italic text-center">
            Nenhuma expedição registrada no período.
          </p>
        ) : (
          <div className="divide-y divide-white/05">
            {packagingReport.map((row) => (
              <div key={row.packaging_type} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/90">{getPackagingLabel(row.packaging_type)}</p>
                  <p className="text-xs text-white/40">{row.order_count} comandas</p>
                </div>
                <span className="text-lg font-bold text-white">{row.total_quantity}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
