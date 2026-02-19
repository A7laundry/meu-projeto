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
import { updateQuoteStatus } from '@/actions/quotes/crud'
import { PIECE_TYPE_LABELS } from '@/types/recipe'
import { QUOTE_STATUS_LABELS, type Quote, type QuoteStatus } from '@/types/pricing'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface QuoteListProps {
  unitId: string
  quotes: Quote[]
}

const STATUS_VARIANT: Record<QuoteStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'secondary',
  sent: 'outline',
  approved: 'default',
  rejected: 'destructive',
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function QuoteList({ unitId, quotes }: QuoteListProps) {
  const [isPending, startTransition] = useTransition()

  function handleStatus(id: string, status: QuoteStatus) {
    startTransition(async () => {
      await updateQuoteStatus(id, unitId, status)
    })
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                Nenhum orçamento criado.
              </TableCell>
            </TableRow>
          )}
          {quotes.map((quote) => (
            <TableRow key={quote.id}>
              <TableCell className="font-medium">{quote.client_name ?? '—'}</TableCell>
              <TableCell className="text-sm text-gray-500">
                {(quote.items ?? []).map((i) => (
                  <span key={i.id} className="block">
                    {PIECE_TYPE_LABELS[i.piece_type as keyof typeof PIECE_TYPE_LABELS] ??
                      i.piece_type}{' '}
                    ×{i.quantity}
                  </span>
                ))}
              </TableCell>
              <TableCell className="font-medium">{formatCurrency(quote.total)}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[quote.status]}>
                  {QUOTE_STATUS_LABELS[quote.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-500 text-sm">
                {format(new Date(quote.created_at), 'dd/MM/yy', { locale: ptBR })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {quote.status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleStatus(quote.id, 'sent')}
                    >
                      Enviar
                    </Button>
                  )}
                  {quote.status === 'sent' && (
                    <>
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleStatus(quote.id, 'approved')}
                      >
                        Aprovar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleStatus(quote.id, 'rejected')}
                        className="text-red-500"
                      >
                        Rejeitar
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
