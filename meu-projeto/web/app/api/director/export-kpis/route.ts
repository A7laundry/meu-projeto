import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exportNetworkKpisCsv } from '@/actions/director/consolidated'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const days = Number(searchParams.get('days') ?? 0)

  const supabase = createAdminClient()
  const { data: units } = await supabase
    .from('units')
    .select('id, name')
    .eq('active', true)
    .order('name')

  const csv = await exportNetworkKpisCsv(units ?? [], days)

  const today = new Date().toISOString().split('T')[0]
  const suffix = days > 0 ? `-${days}d` : ''

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="kpis-rede-${today}${suffix}.csv"`,
    },
  })
}
