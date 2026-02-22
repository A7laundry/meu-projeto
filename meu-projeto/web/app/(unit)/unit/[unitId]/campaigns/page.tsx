import { getBehaviorCampaigns } from '@/actions/commercial/campaigns'
import { CampaignPanel } from '@/components/domain/commercial/campaign-panel'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const revalidate = 0

export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const data = await getBehaviorCampaigns(unitId)

  const totalDormant = data.dormant30.length + data.dormant60.length + data.dormant90.length
  const monthLabel = format(new Date(), 'MMMM', { locale: ptBR })

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Campanhas</h1>
        <p className="text-sm text-white/35 mt-1">
          Disparo via WhatsApp · Segmentado por comportamento de compra
        </p>
      </div>

      {/* Banner de contexto */}
      {(data.birthday.filter(c => c.birthday_today).length > 0 || totalDormant > 0) && (
        <div
          className="rounded-xl px-5 py-4 flex flex-wrap gap-4 items-center"
          style={{
            background: 'linear-gradient(135deg, rgba(214,178,94,0.08) 0%, rgba(5,5,12,0.8) 100%)',
            border: '1px solid rgba(214,178,94,0.18)',
          }}
        >
          {data.birthday.filter(c => c.birthday_today).length > 0 && (
            <span className="text-sm text-white/70">
              🎂 <strong className="text-[#d6b25e]">{data.birthday.filter(c => c.birthday_today).length}</strong> aniversariante{data.birthday.filter(c => c.birthday_today).length !== 1 ? 's' : ''} <strong>hoje</strong>
            </span>
          )}
          {data.birthday.length > 0 && (
            <span className="text-sm text-white/50">
              {data.birthday.length} em {monthLabel}
            </span>
          )}
          {totalDormant > 0 && (
            <span className="text-sm text-white/50">
              ⚠️ <strong className="text-white/70">{totalDormant}</strong> clientes inativos precisam de atenção
            </span>
          )}
        </div>
      )}

      {/* Painel interativo */}
      <CampaignPanel data={data} />
    </div>
  )
}
