import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { listBriefings, publishBriefing } from '@/actions/copywriter/briefings'
import { BriefingFormDialog } from '@/components/domain/copywriter/briefing-form-dialog'
import { DifficultyBadge } from '@/components/domain/copywriter/difficulty-badge'
import { Button } from '@/components/ui/button'

export default async function AdminBriefingsPage() {
  const user = await getUser()
  if (!user || !['director', 'unit_manager'].includes(user.role)) redirect('/copywriter/dashboard')

  const briefings = await listBriefings()

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-xl font-bold text-white/90 mb-1">Gerenciar Briefings</h1>
          <p className="text-sm text-white/40">Crie e gerencie missões para os redatores</p>
        </div>
        <BriefingFormDialog
          trigger={<Button className="btn-gold rounded-lg text-xs px-4 font-semibold">Novo Briefing</Button>}
        />
      </div>

      <div className="card-dark rounded-xl overflow-hidden animate-fade-up stagger-1">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">Título</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">Tipo</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">Dificuldade</th>
              <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">XP</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">Status</th>
              <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {briefings.map((b) => (
              <tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <span className="text-sm text-white/80 font-medium">{b.title}</span>
                </td>
                <td className="px-4 py-3 text-xs text-white/40 capitalize">{b.content_type.replace('_', ' ')}</td>
                <td className="px-4 py-3">
                  <DifficultyBadge difficulty={b.difficulty} />
                </td>
                <td className="px-4 py-3 text-right text-xs text-[#d6b25e]/70 num-stat">+{b.xp_reward}</td>
                <td className="px-4 py-3">
                  <BriefingStatusBadge status={b.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {b.status === 'draft' && (
                      <form action={async () => { 'use server'; await publishBriefing(b.id) }}>
                        <Button type="submit" className="text-[10px] px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-400/30 rounded">
                          Publicar
                        </Button>
                      </form>
                    )}
                    <BriefingFormDialog
                      briefing={b}
                      trigger={
                        <Button className="text-[10px] px-2 py-1 btn-ghost rounded">
                          Editar
                        </Button>
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
            {briefings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-white/25">
                  Nenhum briefing criado ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BriefingStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: 'Rascunho', className: 'text-white/40 bg-white/5 border-white/10' },
    published: { label: 'Publicado', className: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
    in_progress: { label: 'Em Andamento', className: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
    completed: { label: 'Concluído', className: 'text-[#d6b25e] bg-[#d6b25e]/10 border-[#d6b25e]/30' },
    cancelled: { label: 'Cancelado', className: 'text-red-400 bg-red-400/10 border-red-400/30' },
  }
  const c = config[status] ?? config.draft
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${c.className}`}>
      {c.label}
    </span>
  )
}
