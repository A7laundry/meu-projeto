import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { getHistoricalKpis } from '@/actions/director/historical'
import { ExportCsvButton } from './export-csv-button'
import type { Unit } from '@/types/unit'

export const revalidate = 0

const PERIOD_OPTIONS = [
  { label: 'Últimos 7 dias', days: 7 },
  { label: 'Últimos 30 dias', days: 30 },
  { label: 'Últimos 90 dias', days: 90 },
]

interface Props {
  searchParams: Promise<{ days?: string }>
}

export default async function DirectorReportsPage({ searchParams }: Props) {
  const params = await searchParams
  const days = Number(params.days ?? 30)

  const supabase = createAdminClient()
  const { data: units } = await supabase
    .from('units')
    .select('id, name')
    .eq('active', true)
    .order('name')

  const unitIds = (units ?? []).map((u: Pick<Unit, 'id'>) => u.id)
  const rows = await getHistoricalKpis(unitIds, days)

  const maxOrders = Math.max(...rows.map((r) => r.totalOrders), 1)
  const fmtCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Relatórios da Rede</h1>
        <p className="text-sm text-white/40 mt-1">
          Dados históricos consolidados de {units?.length ?? 0} unidades
        </p>
      </div>

      {/* Filtro de período */}
      <div className="flex gap-2 flex-wrap">
        {PERIOD_OPTIONS.map((opt) => (
          <Link
            key={opt.days}
            href={`?days=${opt.days}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              days === opt.days
                ? 'btn-gold rounded-full'
                : 'border-white/15 bg-white/04 text-white/60 hover:border-[#d6b25e]/40 hover:text-white'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Tabela histórica */}
      <div className="card-dark rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/08 flex items-center justify-between">
          <h2 className="font-semibold text-white">KPIs Diários — Últimos {days} dias</h2>
          <ExportCsvButton days={days} />
        </div>

        {rows.length === 0 ? (
          <p className="px-5 py-8 text-sm text-white/30 italic text-center">
            Nenhum dado encontrado para o período.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/08">
                <tr>
                  <th className="text-left px-4 py-3 section-header">Data</th>
                  <th className="text-right px-4 py-3 section-header">Comandas</th>
                  <th className="px-4 py-3 section-header w-32">Volume</th>
                  <th className="text-right px-4 py-3 section-header">Receita paga</th>
                  <th className="text-right px-4 py-3 section-header">Ruptura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/05">
                {rows.map((row) => (
                  <tr key={row.date} className="hover:bg-white/03 transition-colors">
                    <td className="px-4 py-2.5 text-white/70">
                      {new Date(row.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-white">
                      {row.totalOrders}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="h-2 bg-white/08 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(row.totalOrders / maxOrders) * 100}%`,
                            background: 'linear-gradient(90deg, #d6b25e, #b98a2c)',
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-emerald-400">
                      {fmtCurrency(row.totalRevenue)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={`font-medium ${
                          row.breakageRate >= 20
                            ? 'text-red-400'
                            : row.breakageRate >= 10
                              ? 'text-yellow-400'
                              : 'text-white/50'
                        }`}
                      >
                        {row.breakageRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-white/10 font-semibold bg-white/02">
                <tr>
                  <td className="px-4 py-3 text-white/60">Total</td>
                  <td className="px-4 py-3 text-right text-white">
                    {rows.reduce((s, r) => s + r.totalOrders, 0)}
                  </td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right text-emerald-400">
                    {fmtCurrency(rows.reduce((s, r) => s + r.totalRevenue, 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-white/50">
                    {rows.length > 0
                      ? Math.round(
                          rows.reduce((s, r) => s + r.breakageRate, 0) / rows.length,
                        )
                      : 0}
                    % média
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
