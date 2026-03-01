import { listChemicalProducts } from '@/actions/chemicals/crud'
import { ChemicalFormDialog } from '@/components/domain/chemical/chemical-form-dialog'
import { ChemicalList } from '@/components/domain/chemical/chemical-list'
import { getConsumptionReport } from '@/actions/supplies/consumption-report'

export const revalidate = 0

const fmtCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default async function SuppliesPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const [products, consumption] = await Promise.all([
    listChemicalProducts(unitId),
    getConsumptionReport(unitId, 30),
  ])

  const activeCount = products.filter((p) => p.active).length
  const lowStockCount = products.filter(
    (p) => p.active && (p.current_stock ?? 0) < p.minimum_stock
  ).length

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Insumos Químicos</h1>
          <p className="text-sm text-white/40 mt-1">
            {activeCount} produto(s) ativo(s)
            {lowStockCount > 0 && (
              <span className="ml-2 text-red-600 font-medium">
                · {lowStockCount} com estoque baixo
              </span>
            )}
          </p>
        </div>
        <ChemicalFormDialog unitId={unitId} mode="create" />
      </div>

      {/* Consumo - últimos 30 dias */}
      <div className="card-dark rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/08">
          <h2 className="font-semibold text-white">Consumo — {consumption.period}</h2>
        </div>
        <div className="grid grid-cols-3 divide-x divide-white/05">
          <div className="px-5 py-4 text-center">
            <p className="text-xs text-white/40 mb-1">Custo total</p>
            <p className="text-lg font-bold text-red-400">{fmtCurrency(consumption.totalCost)}</p>
          </div>
          <div className="px-5 py-4 text-center">
            <p className="text-xs text-white/40 mb-1">Custo / kg</p>
            <p className="text-lg font-bold text-white">
              {consumption.costPerKg > 0 ? fmtCurrency(consumption.costPerKg) : '—'}
            </p>
          </div>
          <div className="px-5 py-4 text-center">
            <p className="text-xs text-white/40 mb-1">Custo / lavagem</p>
            <p className="text-lg font-bold text-white">
              {consumption.costPerWash > 0 ? fmtCurrency(consumption.costPerWash) : '—'}
            </p>
          </div>
        </div>
        {consumption.byProduct.length > 0 && (
          <div className="border-t border-white/05">
            <div className="divide-y divide-white/05">
              {consumption.byProduct.map((row) => (
                <div key={row.productName} className="px-5 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">{row.productName}</p>
                    <p className="text-xs text-white/35">{row.totalQuantity} un · {row.movementCount} saídas</p>
                  </div>
                  <span className="text-sm font-medium text-red-400/80">{fmtCurrency(row.totalCost)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ChemicalList unitId={unitId} products={products} />
    </div>
  )
}
