'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RecipeFormDialog } from '@/components/domain/recipe/recipe-form-dialog'
import { toggleRecipeActive } from '@/actions/recipes/crud'
import { PIECE_TYPE_LABELS, type Recipe, type PieceType } from '@/types/recipe'

interface RecipeListProps {
  unitId: string
  recipes: Recipe[]
}

const PIECE_TYPE_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  ...Object.entries(PIECE_TYPE_LABELS).map(([value, label]) => ({ value, label })),
]

export function RecipeList({ unitId, recipes }: RecipeListProps) {
  const [filter, setFilter] = useState<PieceType | ''>('')
  const [, startTransition] = useTransition()

  const filtered = filter ? recipes.filter((r) => r.piece_type === filter) : recipes

  function handleToggle(id: string, currentActive: boolean) {
    startTransition(async () => {
      await toggleRecipeActive(id, unitId, !currentActive)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Filtrar por tipo:</span>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as PieceType | '')}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {PIECE_TYPE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo de Peça</TableHead>
              <TableHead>Temperatura</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400 py-12">
                  Nenhuma receita cadastrada. Crie a primeira receita.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((r) => (
              <TableRow key={r.id} className={!r.active ? 'opacity-50' : ''}>
                <TableCell className="font-medium">
                  <div>{r.name}</div>
                  {r.description && (
                    <div className="text-xs text-gray-400 truncate max-w-xs">{r.description}</div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{PIECE_TYPE_LABELS[r.piece_type]}</Badge>
                </TableCell>
                <TableCell>
                  {r.temperature_celsius != null ? `${r.temperature_celsius}°C` : '—'}
                </TableCell>
                <TableCell>
                  {r.duration_minutes != null ? `${r.duration_minutes} min` : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={r.active ? 'default' : 'destructive'}>
                    {r.active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <RecipeFormDialog unitId={unitId} mode="edit" recipe={r} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(r.id, r.active)}
                    >
                      {r.active ? 'Desativar' : 'Ativar'}
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
