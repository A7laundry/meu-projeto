import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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

  const supabase = await createClient()
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
        <h1 className="text-2xl font-bold text-gray-900">Relatórios da Rede</h1>
        <p className="text-sm text-gray-500 mt-1">
          Dados históricos consolidados de {units?.length ?? 0} unidades
        </p>
      </div>

      {/* Filtro de período */}
      <div className="flex gap-2 flex-wrap">
        {PERIOD_OPTIONS.map((opt) => (
          <Link
            key={opt.days}
            href={`?days=${opt.days}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              days === opt.days
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Tabela histórica */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">KPIs Diários — Últimos {days} dias</h2>
          <ExportCsvButton days={days} />
        </div>

        {rows.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-400 italic text-center">
            Nenhum dado encontrado para o período.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Data</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">Comandas</th>
                  <th className="px-4 py-2 font-medium text-gray-600 w-32">Volume</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">Receita paga</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">Ruptura</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.date} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-700">
                      {new Date(row.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-gray-800">
                      {row.totalOrders}
                    </td>
                    <td className="px-4 py-2">
                      {/* Sparkline CSS */}
                      <div className="h-4 bg-gray-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-blue-400 rounded"
                          style={{ width: `${(row.totalOrders / maxOrders) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right text-green-700">
                      {fmtCurrency(row.totalRevenue)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span
                        className={`font-medium ${
                          row.breakageRate >= 20
                            ? 'text-red-700'
                            : row.breakageRate >= 10
                              ? 'text-yellow-600'
                              : 'text-gray-600'
                        }`}
                      >
                        {row.breakageRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t font-semibold">
                <tr>
                  <td className="px-4 py-2 text-gray-700">Total</td>
                  <td className="px-4 py-2 text-right text-gray-800">
                    {rows.reduce((s, r) => s + r.totalOrders, 0)}
                  </td>
                  <td className="px-4 py-2" />
                  <td className="px-4 py-2 text-right text-green-700">
                    {fmtCurrency(rows.reduce((s, r) => s + r.totalRevenue, 0))}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">
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
