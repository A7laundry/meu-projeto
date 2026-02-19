import { listChemicalProducts } from '@/actions/chemicals/crud'
import { ChemicalFormDialog } from '@/components/domain/chemical/chemical-form-dialog'
import { ChemicalList } from '@/components/domain/chemical/chemical-list'

export const revalidate = 0

export default async function SuppliesPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const products = await listChemicalProducts(unitId)

  const activeCount = products.filter((p) => p.active).length
  const lowStockCount = products.filter(
    (p) => p.active && (p.current_stock ?? 0) < p.minimum_stock
  ).length

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Insumos Químicos</h1>
          <p className="text-sm text-gray-500 mt-1">
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

      <ChemicalList unitId={unitId} products={products} />
    </div>
  )
}
