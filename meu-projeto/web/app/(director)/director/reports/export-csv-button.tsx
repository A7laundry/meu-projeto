'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  days: number
}

export function ExportCsvButton({ days }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleExport() {
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/director/export-kpis?days=${days}`)
        if (!res.ok) {
          setError('Erro ao gerar relatório')
          return
        }
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const today = new Date().toISOString().split('T')[0]
        a.href = url
        a.download = `kpis-rede-${today}-${days}d.csv`
        a.click()
        URL.revokeObjectURL(url)
      } catch {
        setError('Erro ao gerar relatório')
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      {error && <p className="text-xs text-red-400">{error}</p>}
      <Button
        onClick={handleExport}
        disabled={isPending}
        size="sm"
        className="btn-ghost text-white/70 text-xs"
      >
        {isPending ? 'Gerando...' : '⬇ Exportar CSV'}
      </Button>
    </div>
  )
}
