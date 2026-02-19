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
import { markPayablePaid } from '@/actions/financial/payables'
import {
  FINANCIAL_STATUS_LABELS,
  PAYABLE_CATEGORY_LABELS,
  type FinancialStatus,
  type Payable,
} from '@/types/financial'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PayableFormDialog } from './payable-form-dialog'

interface PayableListProps {
  unitId: string
  payables: Payable[]
}

const STATUS_VARIANT: Record<FinancialStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  paid: 'default',
  overdue: 'destructive',
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function PayableList({ unitId, payables }: PayableListProps) {
  const [isPending, startTransition] = useTransition()

  function handlePaid(id: string) {
    startTransition(async () => {
      await markPayablePaid(id, unitId)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <PayableFormDialog unitId={unitId} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payables.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                  Nenhuma conta a pagar.
                </TableCell>
              </TableRow>
            )}
            {payables.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.description}</TableCell>
                <TableCell className="text-gray-500">{p.supplier ?? '—'}</TableCell>
                <TableCell className="text-gray-500">
                  {PAYABLE_CATEGORY_LABELS[p.category]}
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(p.amount)}</TableCell>
                <TableCell className="text-gray-500">
                  {format(new Date(p.due_date + 'T12:00:00'), 'dd/MM/yy', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[p.status]}>
                    {FINANCIAL_STATUS_LABELS[p.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {p.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handlePaid(p.id)}
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
    </div>
  )
}
