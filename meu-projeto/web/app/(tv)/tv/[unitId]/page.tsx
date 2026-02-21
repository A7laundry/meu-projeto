import { createClient } from '@/lib/supabase/server'
import { TVPanel } from '@/components/domain/production/tv-panel'
import { notFound } from 'next/navigation'

export default async function TvPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const supabase = await createClient()

  const { data: unit } = await supabase
    .from('units')
    .select('id, name')
    .eq('id', unitId)
    .single()

  if (!unit) notFound()

  return <TVPanel unitId={unit.id} unitName={unit.name} />
}
