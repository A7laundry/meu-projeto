'use client'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CashflowWeek } from '@/actions/financial/cashflow'

interface CashflowTableProps {
  weeks: CashflowWeek[]
  totalInflows: number
  totalOutflows: number
  net: number
  year: number
  month: number
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function exportCsv(weeks: CashflowWeek[], year: number, month: number) {
  const rows = [
    ['Semana', 'Entradas', 'Saídas', 'Saldo'],
    ...weeks.map((w) => [w.label, w.inflows.toFixed(2), w.outflows.toFixed(2), w.net.toFixed(2)]),
  ]
  const csv = rows.map((r) => r.join(';')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fluxo-caixa-${year}-${String(month).padStart(2, '0')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function CashflowTable({ weeks, totalInflows, totalOutflows, net, year, month }: CashflowTableProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => exportCsv(weeks, year, month)}>
          Exportar CSV
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Período</TableHead>
              <TableHead className="text-right text-green-700">Entradas</TableHead>
              <TableHead className="text-right text-red-700">Saídas</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weeks.map((w) => (
              <TableRow key={w.week}>
                <TableCell>{w.label}</TableCell>
                <TableCell className="text-right text-green-700">{fmt(w.inflows)}</TableCell>
                <TableCell className="text-right text-red-700">{fmt(w.outflows)}</TableCell>
                <TableCell
                  className={`text-right font-medium ${w.net >= 0 ? 'text-blue-700' : 'text-orange-700'}`}
                >
                  {fmt(w.net)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-gray-50 font-semibold">
              <TableCell>Total do mês</TableCell>
              <TableCell className="text-right text-green-800">{fmt(totalInflows)}</TableCell>
              <TableCell className="text-right text-red-800">{fmt(totalOutflows)}</TableCell>
              <TableCell
                className={`text-right font-bold ${net >= 0 ? 'text-blue-800' : 'text-orange-800'}`}
              >
                {fmt(net)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
