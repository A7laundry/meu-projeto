import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { getStoreKpis } from '@/actions/store/kpis'
import { getWeeklyRevenueTrend } from '@/actions/store/goals'
import { KpiCard } from '@/components/domain/kpi/kpi-card'
import { StoreGoalGauge } from '@/components/domain/store/store-goal-gauge'
import { StoreGoalForm } from '@/components/domain/store/store-goal-form'
import { StoreWeeklyChart } from '@/components/domain/store/store-weekly-chart'
import { StoreQuickActions } from '@/components/domain/store/store-quick-actions'
import {
  ShoppingBag,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react'

export default async function StoreDashboardPage() {
  const user = await getUser()
  if (!user || user.role !== 'store' || !user.unit_id) redirect('/login')

  const [kpis, weeklyTrend] = await Promise.all([
    getStoreKpis(user.unit_id),
    getWeeklyRevenueTrend(user.unit_id),
  ])

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-[10px] uppercase tracking-widest font-semibold mb-1"
            style={{ color: 'rgba(52,211,153,0.40)' }}
          >
            Dashboard
          </p>
          <h1 className="text-xl font-bold text-white tracking-tight">Visão Geral da Loja</h1>
        </div>
        <StoreGoalForm unitId={user.unit_id} currentGoal={kpis.dailyGoal} />
      </div>

      {/* Meta do Dia + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Gauge */}
        <div className="lg:col-span-4 card-emerald rounded-xl p-5 flex items-center justify-center">
          <StoreGoalGauge
            revenue={kpis.revenueToday}
            goal={kpis.dailyGoal}
            progress={kpis.goalProgress}
          />
        </div>

        {/* KPI grid */}
        <div className="lg:col-span-8 space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              title="Comandas Hoje"
              value={kpis.ordersToday}
              icon={ShoppingBag}
              iconColor="#34d399"
              iconBg="rgba(52,211,153,0.12)"
              stagger={1}
            />
            <KpiCard
              title="Receita Hoje"
              value={`R$ ${kpis.revenueToday.toFixed(0)}`}
              icon={DollarSign}
              iconColor="#34d399"
              iconBg="rgba(52,211,153,0.12)"
              stagger={2}
            />
            <KpiCard
              title="Clientes"
              value={kpis.clientsServedToday}
              icon={Users}
              iconColor="#34d399"
              iconBg="rgba(52,211,153,0.12)"
              stagger={3}
            />
            <KpiCard
              title="Ticket Médio"
              value={`R$ ${kpis.avgTicketToday.toFixed(0)}`}
              icon={TrendingUp}
              iconColor="#34d399"
              iconBg="rgba(52,211,153,0.12)"
              stagger={4}
            />
          </div>

          {/* Status cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card-stat-emerald rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}
                >
                  <Clock size={16} style={{ color: '#fbbf24' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold num-stat text-white">{kpis.ordersInQueue}</p>
                  <p className="text-[11px] text-white/40">Na Fila</p>
                </div>
              </div>
            </div>
            <div className="card-stat-emerald rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}
                >
                  <CheckCircle size={16} style={{ color: '#34d399' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold num-stat" style={{ color: '#34d399' }}>{kpis.ordersReady}</p>
                  <p className="text-[11px] text-white/40">Prontas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <StoreWeeklyChart data={weeklyTrend} />

      {/* Quick actions */}
      <div>
        <p
          className="text-[10px] uppercase tracking-widest font-semibold mb-3"
          style={{ color: 'rgba(52,211,153,0.40)' }}
        >
          Ações Rápidas
        </p>
        <StoreQuickActions />
      </div>
    </div>
  )
}
