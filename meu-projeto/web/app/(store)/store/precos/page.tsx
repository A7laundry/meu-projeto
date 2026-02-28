import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { listPriceTable } from '@/actions/pricing/crud'
import { PIECE_TYPE_LABELS } from '@/types/recipe'
import { PRICE_UNIT_LABELS } from '@/types/pricing'

export default async function StorePrecosPage() {
  const user = await getUser()
  if (!user || user.role !== 'store' || !user.unit_id) redirect('/login')

  const prices = await listPriceTable(user.unit_id)
  const activePrices = prices.filter(p => p.active)

  // Group by piece_type
  const grouped = new Map<string, typeof activePrices>()
  for (const p of activePrices) {
    const existing = grouped.get(p.piece_type) ?? []
    existing.push(p)
    grouped.set(p.piece_type, existing)
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div>
        <p
          className="text-[10px] uppercase tracking-widest font-semibold mb-1"
          style={{ color: 'rgba(52,211,153,0.40)' }}
        >
          Tabela de Preços
        </p>
        <h1 className="text-xl font-bold text-white tracking-tight">Preços da Unidade</h1>
        <p className="text-xs text-white/30 mt-1">Tabela de preços vigente (somente leitura)</p>
      </div>

      {activePrices.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-3xl mb-3">💰</p>
          <p className="font-medium text-white/50">Nenhum preço cadastrado.</p>
          <p className="text-sm text-white/25 mt-1">Solicite ao gerente da unidade.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([pieceType, entries]) => (
            <div key={pieceType}>
              <p className="section-title mb-2" style={{ color: 'rgba(52,211,153,0.50)' }}>
                {PIECE_TYPE_LABELS[pieceType as keyof typeof PIECE_TYPE_LABELS] ?? pieceType}
              </p>
              <div className="space-y-1">
                {entries.map(entry => (
                  <div
                    key={entry.id}
                    className="rounded-lg px-4 py-3 flex items-center justify-between"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div>
                      <p className="text-sm text-white/70">
                        {entry.item_name || PIECE_TYPE_LABELS[pieceType as keyof typeof PIECE_TYPE_LABELS] || pieceType}
                      </p>
                      {entry.fabric_type && (
                        <p className="text-[10px] text-white/30">{entry.fabric_type}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold num-stat" style={{ color: '#34d399' }}>
                        R$ {Number(entry.price).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-white/25">
                        {PRICE_UNIT_LABELS[entry.unit_label]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
