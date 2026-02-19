'use client'

import { useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { markReceivablePaid } from '@/actions/financial/receivables'
import { FINANCIAL_STATUS_LABELS, type FinancialStatus, type Receivable } from '@/types/financial'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ReceivableListProps {
  unitId: string
  receivables: Receivable[]
}

const STATUS_VARIANT: Record<FinancialStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  paid: 'default',
  overdue: 'destructive',
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function ReceivableList({ unitId, receivables }: ReceivableListProps) {
  const [isPending, startTransition] = useTransition()

  function handlePaid(id: string) {
    startTransition(async () => {
      await markReceivablePaid(id, unitId)
    })
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receivables.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                Nenhuma conta a receber.
              </TableCell>
            </TableRow>
          )}
          {receivables.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.description}</TableCell>
              <TableCell className="text-gray-500">{r.client_name ?? '—'}</TableCell>
              <TableCell className="font-medium">{formatCurrency(r.amount)}</TableCell>
              <TableCell className="text-gray-500">
                {format(new Date(r.due_date + 'T12:00:00'), 'dd/MM/yy', { locale: ptBR })}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[r.status]}>
                  {FINANCIAL_STATUS_LABELS[r.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {r.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handlePaid(r.id)}
                    className="text-green-600 hover:text-green-800"
                  >
                    Marcar pago
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
