import type { UnitNpsScore } from '@/types/nps'

interface Props {
  scores: UnitNpsScore[]
}

function npsColor(score: number | null): string {
  if (score === null) return 'text-white/30'
  if (score >= 50) return 'text-emerald-400'
  if (score >= 0) return 'text-yellow-400'
  return 'text-red-400'
}

function npsCard(score: number | null): string {
  if (score === null) return 'card-dark'
  if (score >= 50) return 'card-stat'
  if (score >= 0) return 'card-warn'
  return 'card-alert'
}

export function NpsSummary({ scores }: Props) {
  const withData = scores.filter((s) => s.totalResponses > 0)

  if (withData.length === 0) {
    return (
      <p className="text-sm text-white/30 italic">
        Nenhuma resposta de NPS registrada ainda.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {withData.map((unit) => (
        <div
          key={unit.unitId}
          className={`rounded-xl p-4 space-y-1 ${npsCard(unit.score)}`}
        >
          <p className="text-xs font-semibold text-white/50 truncate uppercase tracking-wider">{unit.unitName}</p>
          <p className={`text-2xl font-bold ${npsColor(unit.score)}`}>
            {unit.score !== null ? (unit.score >= 0 ? `+${unit.score}` : unit.score) : '—'}
          </p>
          <p className="text-xs text-white/30">
            {unit.totalResponses} resposta{unit.totalResponses !== 1 ? 's' : ''}
          </p>
          <div className="text-xs flex gap-2">
            <span className="text-emerald-400">😊 {unit.promoters}</span>
            <span className="text-white/30">😐 {unit.passives}</span>
            <span className="text-red-400">😞 {unit.detractors}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
