import { createClient } from '@/lib/supabase/server'
import { getNpsScoreByUnit, getRecentNpsSurveys } from '@/actions/director/nps'
import { createNpsSurvey } from '@/actions/nps/respond'
import { NpsSummary } from '@/components/domain/director/nps-summary'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Unit } from '@/types/unit'

export const revalidate = 0

export default async function DirectorNpsPage() {
  const supabase = await createClient()

  const { data: units } = await supabase
    .from('units')
    .select('id, name')
    .eq('active', true)
    .order('name')

  const unitList = (units ?? []) as Pick<Unit, 'id' | 'name'>[]
  const unitIds = unitList.map((u) => u.id)

  const [scores, recent] = await Promise.all([
    getNpsScoreByUnit(unitList),
    getRecentNpsSurveys(unitIds, 30),
  ])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">NPS por Unidade</h1>
        <p className="text-sm text-gray-500 mt-1">
          Net Promoter Score — últimos 90 dias
        </p>
      </div>

      {/* Scores por unidade */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Score por Unidade
        </h2>
        <NpsSummary scores={scores} />
      </section>

      {/* Ações: criar pesquisa */}
      <section className="rounded-lg border bg-white p-5 space-y-3">
        <h2 className="font-semibold text-gray-800">Criar Nova Pesquisa</h2>
        <p className="text-sm text-gray-500">
          Selecione uma unidade para gerar um link de pesquisa NPS.
        </p>
        <div className="flex flex-wrap gap-2">
          {unitList.map((unit) => (
            <form
              key={unit.id}
              action={async () => {
                'use server'
                await createNpsSurvey(unit.id)
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                + {unit.name}
              </Button>
            </form>
          ))}
        </div>
      </section>

      {/* Respostas recentes */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Pesquisas Recentes
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Nenhuma pesquisa encontrada.</p>
        ) : (
          <div className="rounded-lg border bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Unidade</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Cliente</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Enviada</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Score</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Comentário</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {recent.map((survey) => {
                  const response = (
                    survey.nps_responses as unknown as Array<{
                      score: number
                      comment: string | null
                    }>
                  )?.[0]
                  const client = survey.clients as unknown as { name: string } | null

                  return (
                    <tr key={survey.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-700">
                        {units?.find((u) => u.id === survey.unit_id)?.name ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-gray-600">{client?.name ?? '—'}</td>
                      <td className="px-4 py-2 text-gray-500">
                        {new Date(survey.sent_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-2">
                        {response ? (
                          <span
                            className={`font-bold ${
                              response.score >= 9
                                ? 'text-green-700'
                                : response.score >= 7
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                            }`}
                          >
                            {response.score}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Aguardando</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-gray-500 max-w-xs truncate">
                        {response?.comment ?? '—'}
                      </td>
                      <td className="px-4 py-2">
                        <Link
                          href={`/nps/${survey.id}`}
                          target="_blank"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Link
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
