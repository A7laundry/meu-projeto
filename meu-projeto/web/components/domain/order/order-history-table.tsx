'use client'

import { useState, useTransition, useCallback } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getOrderHistory } from '@/actions/orders/history'
import type { Order, OrderStatus } from '@/types/order'

const STATUS_LABELS: Record<OrderStatus, string> = {
  received: 'Recebido',
  sorting: 'Triagem',
  washing: 'Lavagem',
  drying: 'Secagem',
  ironing: 'Passadoria',
  ready: 'Pronto',
  shipped: 'Expedido',
  delivered: 'Entregue',
}

const STATUS_VARIANT: Partial<Record<OrderStatus, 'default' | 'secondary' | 'destructive'>> = {
  delivered: 'default',
  shipped: 'default',
  ready: 'secondary',
}

const ALL_STATUSES = Object.keys(STATUS_LABELS) as OrderStatus[]

interface OrderHistoryTableProps {
  unitId: string
  initialOrders: Order[]
  initialTotal: number
}

export function OrderHistoryTable({
  unitId,
  initialOrders,
  initialTotal,
}: OrderHistoryTableProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [isPending, startTransition] = useTransition()

  const fetchOrders = useCallback(
    (params: {
      search?: string
      status?: string
      dateFrom?: string
      dateTo?: string
      page?: number
    }) => {
      startTransition(async () => {
        const result = await getOrderHistory(unitId, params)
        setOrders(result.orders)
        setTotal(result.total)
        setPage(result.page)
      })
    },
    [unitId]
  )

  function handleSearch(value: string) {
    setSearch(value)
    // Debounce simples: só busca após pausar digitação
    const timer = setTimeout(
      () => fetchOrders({ search: value, status, dateFrom, dateTo, page: 1 }),
      300
    )
    return () => clearTimeout(timer)
  }

  function handleFilter() {
    fetchOrders({ search, status, dateFrom, dateTo, page: 1 })
  }

  function handlePage(newPage: number) {
    fetchOrders({ search, status, dateFrom, dateTo, page: newPage })
  }

  function exportCsv() {
    const header = 'Número,Cliente,Status,Peças,Criado em'
    const rows = orders.map((o) => {
      const pieces = o.items?.reduce((s, i) => s + i.quantity, 0) ?? 0
      const created = format(new Date(o.created_at), 'dd/MM/yyyy HH:mm')
      return `"${o.order_number}","${o.client_name}","${STATUS_LABELS[o.status]}","${pieces}","${created}"`
    })
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historico-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3 p-4 bg-[rgba(255,255,255,0.03)] rounded-xl border">
        <div className="flex-1 min-w-48">
          <label className="text-xs text-white/40 mb-1 block">Buscar</label>
          <Input
            placeholder="Nº comanda ou cliente..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="w-36">
          <label className="text-xs text-white/40 mb-1 block">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">De</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-8 text-sm w-36"
          />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Até</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-8 text-sm w-36"
          />
        </div>
        <Button size="sm" onClick={handleFilter} disabled={isPending}>
          Filtrar
        </Button>
        <Button size="sm" variant="outline" onClick={exportCsv}>
          Exportar CSV
        </Button>
      </div>

      {/* Contagem */}
      <p className="text-sm text-white/40">
        {isPending ? 'Carregando...' : `${total} comanda(s) encontrada(s)`}
      </p>

      {/* Tabela */}
      <div className="rounded-xl border bg-[rgba(255,255,255,0.04)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[rgba(255,255,255,0.03)] border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-white/55">Comanda</th>
              <th className="text-left px-4 py-3 font-medium text-white/55">Cliente</th>
              <th className="text-left px-4 py-3 font-medium text-white/55">Status</th>
              <th className="text-right px-4 py-3 font-medium text-white/55">Peças</th>
              <th className="text-left px-4 py-3 font-medium text-white/55">Criado em</th>
              <th className="text-left px-4 py-3 font-medium text-white/55">Promessa</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-white/35 py-12">
                  Nenhuma comanda encontrada.
                </td>
              </tr>
            )}
            {orders.map((o) => {
              const pieces = o.items?.reduce((s, i) => s + i.quantity, 0) ?? 0
              return (
                <tr key={o.id} className="hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/unit/${unitId}/production/orders/${o.id}`}
                      className="font-mono font-bold text-[#60a5fa] hover:underline"
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-white/75">{o.client_name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[o.status] ?? 'secondary'}>
                      {STATUS_LABELS[o.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{pieces}</td>
                  <td className="px-4 py-3 text-white/40">
                    {format(new Date(o.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                  </td>
                  <td className="px-4 py-3 text-white/40">
                    {format(new Date(o.promised_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isPending}
            onClick={() => handlePage(page - 1)}
          >
            ← Anterior
          </Button>
          <span className="text-sm text-white/40">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isPending}
            onClick={() => handlePage(page + 1)}
          >
            Próxima →
          </Button>
        </div>
      )}
    </div>
  )
}
