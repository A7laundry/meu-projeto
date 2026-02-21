import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function ProductionPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Produção</h1>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/unit/${unitId}/production/orders`}>Ver Comandas</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/unit/${unitId}/production/orders/new`}>Nova Comanda</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/unit/${unitId}/production/history`}>Histórico</Link>
        </Button>
      </div>
    </div>
  )
}
