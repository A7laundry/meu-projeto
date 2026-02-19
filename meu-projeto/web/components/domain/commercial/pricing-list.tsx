'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PricingFormDialog } from '@/components/domain/commercial/pricing-form-dialog'
import { PIECE_TYPE_LABELS } from '@/types/recipe'
import { PRICE_UNIT_LABELS, type PriceTableEntry } from '@/types/pricing'

interface PricingListProps {
  unitId: string
  entries: PriceTableEntry[]
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function PricingList({ unitId, entries }: PricingListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <PricingFormDialog unitId={unitId} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo de Peça</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                  Nenhum preço cadastrado. Clique em &quot;Novo Preço&quot; para começar.
                </TableCell>
              </TableRow>
            )}
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">
                  {PIECE_TYPE_LABELS[entry.piece_type as keyof typeof PIECE_TYPE_LABELS] ??
                    entry.piece_type}
                </TableCell>
                <TableCell>{formatCurrency(entry.price)}</TableCell>
                <TableCell className="text-gray-500">
                  {PRICE_UNIT_LABELS[entry.unit_label] ?? entry.unit_label}
                </TableCell>
                <TableCell className="text-right">
                  <PricingFormDialog
                    unitId={unitId}
                    entry={entry}
                    trigger={
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        Editar
                      </button>
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
