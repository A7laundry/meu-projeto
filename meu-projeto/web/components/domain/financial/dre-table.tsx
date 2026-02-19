import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { DreRow } from '@/actions/financial/cashflow'

interface DreTableProps {
  rows: DreRow[]
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function DreTable({ rows }: DreTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>DRE Simplificado</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow
              key={idx}
              className={row.isTotal ? 'bg-gray-50 font-semibold border-t-2' : ''}
            >
              <TableCell className={row.isTotal ? 'font-semibold' : 'text-gray-700'}>
                {row.label}
              </TableCell>
              <TableCell
                className={`text-right ${
                  row.isTotal
                    ? row.isPositive
                      ? 'font-bold text-blue-700'
                      : 'font-bold text-red-700'
                    : row.isPositive
                      ? 'text-green-700'
                      : 'text-red-600'
                }`}
              >
                {fmt(row.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
