'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
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
import { toggleClientActive } from '@/actions/clients/crud'
import { ClientFormDialog } from '@/components/domain/client/client-form-dialog'
import { CLIENT_TYPE_LABELS, type Client } from '@/types/logistics'

interface ClientListProps {
  unitId: string
  initialClients: Client[]
}

export function ClientList({ unitId, initialClients }: ClientListProps) {
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = initialClients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.document ?? '').includes(search) ||
      (c.phone ?? '').includes(search),
  )

  function handleToggle(client: Client) {
    startTransition(async () => {
      await toggleClientActive(client.id, unitId, !client.active)
    })
  }

  function formatAddress(c: Client) {
    const parts = [c.address_street, c.address_number, c.address_city].filter(Boolean)
    return parts.join(', ') || '—'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          placeholder="Buscar por nome, documento ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-premium max-w-sm"
          style={{ padding: '9px 14px', borderRadius: 10, fontSize: 14 }}
        />
        <ClientFormDialog unitId={unitId} />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <Table>
          <TableHeader>
            <TableRow style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
              <TableHead className="text-white/40 text-xs uppercase tracking-wider">Nome</TableHead>
              <TableHead className="text-white/40 text-xs uppercase tracking-wider">Tipo</TableHead>
              <TableHead className="text-white/40 text-xs uppercase tracking-wider">Documento</TableHead>
              <TableHead className="text-white/40 text-xs uppercase tracking-wider">Telefone</TableHead>
              <TableHead className="text-white/40 text-xs uppercase tracking-wider">Endereço</TableHead>
              <TableHead className="text-white/40 text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-right text-white/40 text-xs uppercase tracking-wider">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-white/25 py-8">
                  {search ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((client) => (
              <TableRow
                key={client.id}
                className={!client.active ? 'opacity-50' : ''}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <TableCell className="font-medium">
                  <Link
                    href={`/unit/${unitId}/clients/${client.id}`}
                    className="text-[#d6b25e] hover:text-[#e8cc7e] transition-colors"
                  >
                    {client.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-white/15 text-white/55 text-xs">{CLIENT_TYPE_LABELS[client.type]}</Badge>
                </TableCell>
                <TableCell className="text-white/40">{client.document ?? '—'}</TableCell>
                <TableCell className="text-white/40">{client.phone ?? '—'}</TableCell>
                <TableCell className="text-white/40 max-w-[200px] truncate">
                  {formatAddress(client)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={client.active ? 'default' : 'secondary'}
                    className={client.active
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25 border text-xs'
                      : 'bg-white/06 text-white/30 border-white/10 border text-xs'}
                  >
                    {client.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <ClientFormDialog
                      unitId={unitId}
                      client={client}
                      trigger={
                        <Button variant="ghost" size="sm" className="text-white/45 hover:text-white/80 hover:bg-white/06">
                          Editar
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleToggle(client)}
                      className="text-white/35 hover:text-white/65 hover:bg-white/06"
                    >
                      {client.active ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
