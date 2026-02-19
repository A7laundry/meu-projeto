'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleUnitStatus } from '@/actions/units/crud'

interface UnitToggleButtonProps {
  id: string
  active: boolean
}

export function UnitToggleButton({ id, active }: UnitToggleButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    await toggleUnitStatus(id, !active)
    setLoading(false)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={active ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}
    >
      {loading ? '...' : active ? 'Desativar' : 'Ativar'}
    </Button>
  )
}
