import type { UnitNpsScore } from '@/types/nps'

interface Props {
  scores: UnitNpsScore[]
}

function npsColor(score: number | null): string {
  if (score === null) return 'text-gray-400'
  if (score >= 50) return 'text-green-700'
  if (score >= 0) return 'text-yellow-600'
  return 'text-red-700'
}

function npsBg(score: number | null): string {
  if (score === null) return 'bg-gray-50 border-gray-200'
  if (score >= 50) return 'bg-green-50 border-green-200'
  if (score >= 0) return 'bg-yellow-50 border-yellow-200'
  return 'bg-red-50 border-red-200'
}

export function NpsSummary({ scores }: Props) {
  const withData = scores.filter((s) => s.totalResponses > 0)

  if (withData.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">
        Nenhuma resposta de NPS registrada ainda.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {withData.map((unit) => (
        <div
          key={unit.unitId}
          className={`rounded-lg border p-3 space-y-1 ${npsBg(unit.score)}`}
        >
          <p className="text-xs font-medium text-gray-600 truncate">{unit.unitName}</p>
          <p className={`text-2xl font-bold ${npsColor(unit.score)}`}>
            {unit.score !== null ? (unit.score >= 0 ? `+${unit.score}` : unit.score) : '—'}
          </p>
          <p className="text-xs text-gray-500">
            {unit.totalResponses} resposta{unit.totalResponses !== 1 ? 's' : ''}
          </p>
          <div className="text-xs text-gray-400 flex gap-2">
            <span className="text-green-600">😊 {unit.promoters}</span>
            <span className="text-gray-400">😐 {unit.passives}</span>
            <span className="text-red-500">😞 {unit.detractors}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
