'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
        <Input
          placeholder="Buscar por nome, documento ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <ClientFormDialog unitId={unitId} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                  {search ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((client) => (
              <TableRow key={client.id} className={!client.active ? 'opacity-50' : ''}>
                <TableCell className="font-medium">
                  <Link
                    href={`/unit/${unitId}/clients/${client.id}`}
                    className="hover:underline text-blue-700"
                  >
                    {client.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{CLIENT_TYPE_LABELS[client.type]}</Badge>
                </TableCell>
                <TableCell className="text-gray-500">{client.document ?? '—'}</TableCell>
                <TableCell className="text-gray-500">{client.phone ?? '—'}</TableCell>
                <TableCell className="text-gray-500 max-w-[200px] truncate">
                  {formatAddress(client)}
                </TableCell>
                <TableCell>
                  <Badge variant={client.active ? 'default' : 'secondary'}>
                    {client.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <ClientFormDialog
                      unitId={unitId}
                      client={client}
                      trigger={
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleToggle(client)}
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
