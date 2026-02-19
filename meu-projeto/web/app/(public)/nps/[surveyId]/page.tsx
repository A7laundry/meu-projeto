'use client'

import { useState, useTransition } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { submitNpsResponse } from '@/actions/nps/respond'

const SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

function scoreColor(score: number): string {
  if (score >= 9) return 'bg-green-500 hover:bg-green-600 text-white'
  if (score >= 7) return 'bg-yellow-400 hover:bg-yellow-500 text-white'
  return 'bg-red-400 hover:bg-red-500 text-white'
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
        setError(result.error)
      }
    })
  }

  if (done) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8 max-w-md w-full text-center space-y-4">
        <p className="text-3xl">🙏</p>
        <h2 className="text-xl font-bold text-gray-800">Obrigado pelo seu feedback!</h2>
        <p className="text-sm text-gray-500">Sua resposta foi registrada com sucesso.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-8 max-w-md w-full space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-gray-800">Pesquisa de Satisfação</h1>
        <p className="text-sm text-gray-500">
          Em uma escala de 0 a 10, o quanto você recomendaria nossos serviços?
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex gap-1 flex-wrap justify-center">
          {SCORES.map((s) => (
            <button
              key={s}
              onClick={() => setSelected(s)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                selected === s
                  ? scoreColor(s) + ' ring-2 ring-offset-1 ring-current'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Não recomendaria</span>
          <span>Recomendaria muito</span>
        </div>
      </div>

      {selected !== null && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Gostaria de deixar um comentário? (opcional)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Conte-nos mais sobre sua experiência..."
            rows={3}
            maxLength={500}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={selected === null || isPending}
        className="w-full"
      >
        {isPending ? 'Enviando...' : 'Enviar resposta'}
      </Button>
    </div>
  )
}
