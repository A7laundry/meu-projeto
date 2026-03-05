import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { getCashflowData, getDreData } from '@/actions/financial/cashflow'
import { StoreCashflowTable } from '@/components/domain/store/store-cashflow-table'
import { StoreDreTable } from '@/components/domain/store/store-dre-table'
import Link from 'next/link'
import { ArrowLeft, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'

export default async function CashflowPage() {
  const user = await getUser()
  if (!user || user.role !== 'store' || !user.unit_id) redirect('/login')

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const [cashflow, dre] = await Promise.all([
    getCashflowData(user.unit_id, year, month),
    getDreData(user.unit_id, year, month),
  ])

  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/store/financeiro"
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
        >
          <ArrowLeft size={16} style={{ color: 'rgba(255,255,255,0.50)' }} />
        </Link>
        <PageHeader
          overline="Fluxo de Caixa & DRE"
          title={monthLabel}
          accent="#10b981"
          icon={Wallet}
        />
      </div>

      {/* Cashflow */}
      <div>
        <p className="section-title mb-3" style={{ color: 'rgba(52,211,153,0.50)' }}>
          Fluxo de Caixa Semanal
        </p>
        <StoreCashflowTable
          weeks={cashflow.weeks}
          totalInflows={cashflow.totalInflows}
          totalOutflows={cashflow.totalOutflows}
          net={cashflow.net}
        />
      </div>

      {/* DRE */}
      <div>
        <p className="section-title mb-3" style={{ color: 'rgba(52,211,153,0.50)' }}>
          Demonstração de Resultado (DRE)
        </p>
        <StoreDreTable rows={dre} />
      </div>
    </div>
  )
}
