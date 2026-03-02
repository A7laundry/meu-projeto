export const revalidate = 0

import Link from 'next/link'
import { ArrowLeft, MessageSquareText, AlertCircle, Clock, CheckCircle2, Bug } from 'lucide-react'
import { listAllFeedback, getFeedbackStats } from '@/actions/feedback/crud'
import { FeedbackAdminTable } from '@/components/domain/feedback/feedback-admin-table'

export default async function DirectorFeedbackPage() {
  const [feedbacks, stats] = await Promise.all([
    listAllFeedback(),
    getFeedbackStats(),
  ])

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8">
      <Link
        href="/director/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        <ArrowLeft size={14} />
        Dashboard
      </Link>

      <div>
        <div className="flex items-center gap-3 mb-1">
          <MessageSquareText size={20} className="text-blue-400/70" />
          <h1 className="text-2xl font-bold text-white">Feedback UAT</h1>
        </div>
        <p className="text-sm text-white/40">
          Gerencie o feedback dos testadores durante o período de testes.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={14} className="text-blue-400/60" />
            <p className="text-xs text-white/40">Abertos</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">{stats.open}</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-amber-400/60" />
            <p className="text-xs text-white/40">Em Andamento</p>
          </div>
          <p className="text-2xl font-bold text-amber-400">{stats.in_progress}</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-emerald-400/60" />
            <p className="text-xs text-white/40">Resolvidos</p>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{stats.resolved}</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bug size={14} className="text-red-400/60" />
            <p className="text-xs text-white/40">Bugs Críticos</p>
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.critical_bugs}</p>
        </div>
      </div>

      <FeedbackAdminTable feedbacks={feedbacks} />
    </div>
  )
}
