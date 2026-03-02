'use client'

import { useState, useTransition } from 'react'
import { updateFeedbackStatus } from '@/actions/feedback/crud'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
  ROLE_LABELS,
  type UatFeedback,
  type FeedbackCategory,
  type FeedbackSeverity,
  type FeedbackStatus,
} from '@/types/feedback'
import { Eye, Filter, X } from 'lucide-react'

interface FeedbackAdminTableProps {
  feedbacks: UatFeedback[]
}

export function FeedbackAdminTable({ feedbacks: initialFeedbacks }: FeedbackAdminTableProps) {
  const [selected, setSelected] = useState<UatFeedback | null>(null)
  const [newStatus, setNewStatus] = useState<FeedbackStatus>('open')
  const [adminNotes, setAdminNotes] = useState('')
  const [isPending, startTransition] = useTransition()

  // Filtros
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')

  const filtered = initialFeedbacks.filter((fb) => {
    if (filterCategory !== 'all' && fb.category !== filterCategory) return false
    if (filterSeverity !== 'all' && fb.severity !== filterSeverity) return false
    if (filterStatus !== 'all' && fb.status !== filterStatus) return false
    if (filterRole !== 'all' && fb.user_role !== filterRole) return false
    return true
  })

  function openDetail(fb: UatFeedback) {
    setSelected(fb)
    setNewStatus(fb.status)
    setAdminNotes(fb.admin_notes ?? '')
  }

  function handleSave() {
    if (!selected) return
    startTransition(async () => {
      const result = await updateFeedbackStatus(selected.id, newStatus, adminNotes)
      if (result.success) {
        toast.success('Feedback atualizado')
        setSelected(null)
      } else {
        toast.error(result.error)
      }
    })
  }

  const hasActiveFilters = filterCategory !== 'all' || filterSeverity !== 'all' || filterStatus !== 'all' || filterRole !== 'all'

  function clearFilters() {
    setFilterCategory('all')
    setFilterSeverity('all')
    setFilterStatus('all')
    setFilterRole('all')
  }

  const uniqueRoles = [...new Set(initialFeedbacks.map((fb) => fb.user_role))]

  return (
    <>
      {/* Filtros */}
      <div className="card-dark rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-white/40" />
            <span className="text-xs font-medium text-white/60">Filtros</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors"
            >
              <X size={10} />
              Limpar
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="bg-white/[0.03] border-white/10 text-white/90 text-xs h-8">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {(Object.keys(CATEGORY_LABELS) as FeedbackCategory[]).map((key) => (
                <SelectItem key={key} value={key}>{CATEGORY_LABELS[key]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="bg-white/[0.03] border-white/10 text-white/90 text-xs h-8">
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas severidades</SelectItem>
              {(Object.keys(SEVERITY_LABELS) as FeedbackSeverity[]).map((key) => (
                <SelectItem key={key} value={key}>{SEVERITY_LABELS[key]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-white/[0.03] border-white/10 text-white/90 text-xs h-8">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              {(Object.keys(STATUS_LABELS) as FeedbackStatus[]).map((key) => (
                <SelectItem key={key} value={key}>{STATUS_LABELS[key]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="bg-white/[0.03] border-white/10 text-white/90 text-xs h-8">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos roles</SelectItem>
              {uniqueRoles.map((role) => (
                <SelectItem key={role} value={role}>{ROLE_LABELS[role] ?? role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabela */}
      <div className="card-dark rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[10px] font-medium text-white/40 uppercase tracking-wider px-4 py-3">Testador</th>
                <th className="text-left text-[10px] font-medium text-white/40 uppercase tracking-wider px-4 py-3">Seção</th>
                <th className="text-left text-[10px] font-medium text-white/40 uppercase tracking-wider px-4 py-3">Categoria</th>
                <th className="text-left text-[10px] font-medium text-white/40 uppercase tracking-wider px-4 py-3">Severidade</th>
                <th className="text-left text-[10px] font-medium text-white/40 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-[10px] font-medium text-white/40 uppercase tracking-wider px-4 py-3">Data</th>
                <th className="text-center text-[10px] font-medium text-white/40 uppercase tracking-wider px-4 py-3">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-white/30 py-8 text-xs">
                    Nenhum feedback encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((fb) => (
                  <tr key={fb.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs text-white/80 font-medium">{fb.user_name}</p>
                      <p className="text-[10px] text-white/30">{ROLE_LABELS[fb.user_role] ?? fb.user_role}{fb.user_sector ? ` - ${fb.user_sector}` : ''}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/60">{fb.page_section}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[fb.category]}`}>
                        {CATEGORY_LABELS[fb.category]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {fb.severity ? (
                        <Badge variant="outline" className={`text-[10px] ${SEVERITY_COLORS[fb.severity]}`}>
                          {SEVERITY_LABELS[fb.severity]}
                        </Badge>
                      ) : (
                        <span className="text-white/20 text-[10px]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[fb.status]}`}>
                        {STATUS_LABELS[fb.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-white/30 whitespace-nowrap">
                      {new Date(fb.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openDetail(fb)}
                        title="Ver detalhes"
                      >
                        <Eye size={14} className="text-white/40" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-white/[0.03]">
          <p className="text-[10px] text-white/25">{filtered.length} de {initialFeedbacks.length} feedbacks</p>
        </div>
      </div>

      {/* Dialog de detalhe */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="bg-[#0d1117] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white/90">Detalhes do Feedback</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={CATEGORY_COLORS[selected.category]}>
                  {CATEGORY_LABELS[selected.category]}
                </Badge>
                {selected.severity && (
                  <Badge variant="outline" className={SEVERITY_COLORS[selected.severity]}>
                    {SEVERITY_LABELS[selected.severity]}
                  </Badge>
                )}
                <Badge variant="outline" className={STATUS_COLORS[selected.status]}>
                  {STATUS_LABELS[selected.status]}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-white/40">Testador</p>
                <p className="text-sm text-white/80">{selected.user_name} ({ROLE_LABELS[selected.user_role] ?? selected.user_role}{selected.user_sector ? ` - ${selected.user_sector}` : ''})</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-white/40">Seção</p>
                <p className="text-sm text-white/80">{selected.page_section}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-white/40">Descrição</p>
                <p className="text-sm text-white/70 whitespace-pre-wrap bg-white/[0.02] rounded-lg p-3">{selected.description}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-white/40">Enviado em</p>
                <p className="text-sm text-white/60">{new Date(selected.created_at).toLocaleString('pt-BR')}</p>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">Status</label>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as FeedbackStatus)}>
                    <SelectTrigger className="bg-white/[0.03] border-white/10 text-white/90 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(STATUS_LABELS) as FeedbackStatus[]).map((key) => (
                        <SelectItem key={key} value={key}>{STATUS_LABELS[key]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">Notas do Diretor</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Adicione uma resposta ou observação..."
                    className="min-h-[80px] bg-white/[0.03] border-white/10 text-white/90 placeholder:text-white/20 text-sm resize-none"
                    disabled={isPending}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setSelected(null)}
                    disabled={isPending}
                    className="text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isPending}
                    className="text-xs"
                  >
                    {isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
