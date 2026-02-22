'use client'

import { useState, useTransition } from 'react'
import { useParams } from 'next/navigation'
import { submitNpsResponse } from '@/actions/nps/respond'

const SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

function scoreStyle(score: number, selected: boolean): React.CSSProperties {
  if (selected) {
    if (score >= 9) return { background: 'rgba(52,211,153,0.80)', color: '#fff', border: '2px solid rgba(52,211,153,0.90)' }
    if (score >= 7) return { background: 'rgba(251,191,36,0.75)', color: '#fff', border: '2px solid rgba(251,191,36,0.90)' }
    return { background: 'rgba(248,113,113,0.70)', color: '#fff', border: '2px solid rgba(248,113,113,0.85)' }
  }
  if (score >= 9) return { background: 'rgba(52,211,153,0.08)', color: 'rgba(52,211,153,0.75)', border: '1px solid rgba(52,211,153,0.20)' }
  if (score >= 7) return { background: 'rgba(251,191,36,0.08)', color: 'rgba(251,191,36,0.70)', border: '1px solid rgba(251,191,36,0.20)' }
  return { background: 'rgba(248,113,113,0.07)', color: 'rgba(248,113,113,0.65)', border: '1px solid rgba(248,113,113,0.18)' }
}

const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 20,
  padding: '32px 28px',
}

export default function NpsSurveyPage() {
  const { surveyId } = useParams<{ surveyId: string }>()
  const [selected, setSelected] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    if (selected === null) return
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('surveyId', surveyId)
      fd.set('score', String(selected))
      fd.set('comment', comment)
      const result = await submitNpsResponse(fd)
      if (result.success) {
        setDone(true)
      } else {
        setError(result.error ?? 'Erro ao enviar resposta')
      }
    })
  }

  if (done) {
    return (
      <div className="w-full max-w-md text-center space-y-4" style={CARD}>
        <p className="text-4xl">🙏</p>
        <h2 className="text-xl font-bold text-white">Obrigado pelo feedback!</h2>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Sua resposta foi registrada com sucesso.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-6" style={CARD}>
      {/* Branding */}
      <div className="text-center space-y-1.5">
        <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: '#d6b25e' }}>
          A7x TecNologia
        </p>
        <h1 className="text-xl font-bold text-white">Pesquisa de Satisfação</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Em uma escala de 0 a 10, o quanto você recomendaria nossos serviços?
        </p>
      </div>

      {/* Score buttons */}
      <div className="space-y-3">
        <div className="flex gap-1.5 flex-wrap justify-center">
          {SCORES.map((s) => (
            <button
              key={s}
              onClick={() => setSelected(s)}
              className="w-9 h-9 rounded-lg text-sm font-bold transition-all"
              style={scoreStyle(s, selected === s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[11px]" style={{ color: 'rgba(255,255,255,0.30)' }}>
          <span>Não recomendaria</span>
          <span>Recomendaria muito</span>
        </div>
      </div>

      {/* Comentário */}
      {selected !== null && (
        <div className="space-y-2">
          <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Comentário opcional
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Conte-nos mais sobre sua experiência..."
            rows={3}
            maxLength={500}
            className="input-premium w-full resize-none"
            style={{ borderRadius: 10, padding: '10px 14px', fontSize: 14 }}
          />
        </div>
      )}

      {error && (
        <p className="text-sm" style={{ color: 'rgba(248,113,113,0.80)' }}>{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={selected === null || isPending}
        className="w-full text-sm font-semibold py-3 rounded-xl transition-all"
        style={{
          background: selected !== null
            ? 'linear-gradient(135deg, #d6b25e 0%, #f0d080 100%)'
            : 'rgba(255,255,255,0.06)',
          color: selected !== null ? '#05050a' : 'rgba(255,255,255,0.30)',
          border: 'none',
          cursor: selected !== null ? 'pointer' : 'not-allowed',
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? 'Enviando...' : 'Enviar Resposta'}
      </button>
    </div>
  )
}
