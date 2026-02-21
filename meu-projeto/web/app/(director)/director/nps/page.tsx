import { createAdminClient } from '@/lib/supabase/admin'
import { getNpsScoreByUnit, getRecentNpsSurveys } from '@/actions/director/nps'
import { createNpsSurvey } from '@/actions/nps/respond'
import { NpsSummary } from '@/components/domain/director/nps-summary'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Unit } from '@/types/unit'

export const revalidate = 0

export default async function DirectorNpsPage() {
  const supabase = createAdminClient()

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
        <h1 className="text-2xl font-bold text-white">NPS por Unidade</h1>
        <p className="text-sm text-white/40 mt-1">
          Net Promoter Score — últimos 90 dias
        </p>
      </div>

      {/* Scores por unidade */}
      <section className="space-y-3">
        <h2 className="section-header">Score por Unidade</h2>
        <NpsSummary scores={scores} />
      </section>

      {/* Ações: criar pesquisa */}
      <section className="card-dark rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-white">Criar Nova Pesquisa</h2>
        <p className="text-sm text-white/40">
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
              <Button type="submit" variant="outline" size="sm"
                className="border-white/15 bg-white/5 text-white/70 hover:border-[#d6b25e]/40 hover:bg-[#d6b25e]/08 hover:text-white"
              >
                + {unit.name}
              </Button>
            </form>
          ))}
        </div>
      </section>

      {/* Respostas recentes */}
      <section className="space-y-3">
        <h2 className="section-header">Pesquisas Recentes</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-white/30 italic">Nenhuma pesquisa encontrada.</p>
        ) : (
          <div className="card-dark rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/08">
                <tr>
                  <th className="text-left px-4 py-3 section-header">Unidade</th>
                  <th className="text-left px-4 py-3 section-header">Cliente</th>
                  <th className="text-left px-4 py-3 section-header">Enviada</th>
                  <th className="text-left px-4 py-3 section-header">Score</th>
                  <th className="text-left px-4 py-3 section-header">Comentário</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/05">
                {recent.map((survey) => {
                  const response = (
                    survey.nps_responses as unknown as Array<{
                      score: number
                      comment: string | null
                    }>
                  )?.[0]
                  const client = survey.clients as unknown as { name: string } | null

                  return (
                    <tr key={survey.id} className="hover:bg-white/03 transition-colors">
                      <td className="px-4 py-2.5 text-white/70">
                        {units?.find((u) => u.id === survey.unit_id)?.name ?? '—'}
                      </td>
                      <td className="px-4 py-2.5 text-white/60">{client?.name ?? '—'}</td>
                      <td className="px-4 py-2.5 text-white/40">
                        {new Date(survey.sent_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-2.5">
                        {response ? (
                          <span
                            className={`font-bold ${
                              response.score >= 9
                                ? 'text-emerald-400'
                                : response.score >= 7
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                            }`}
                          >
                            {response.score}
                          </span>
                        ) : (
                          <span className="text-white/25 text-xs italic">Aguardando</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-white/40 max-w-xs truncate">
                        {response?.comment ?? '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/nps/${survey.id}`}
                          target="_blank"
                          className="text-xs text-[#d6b25e] hover:underline"
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
