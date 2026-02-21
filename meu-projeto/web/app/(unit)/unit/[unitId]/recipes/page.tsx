import { listRecipes } from '@/actions/recipes/crud'
import { RecipeFormDialog } from '@/components/domain/recipe/recipe-form-dialog'
import { RecipeList } from '@/components/domain/recipe/recipe-list'

export const revalidate = 0

export default async function RecipesPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const { unitId } = await params
  const recipes = await listRecipes(unitId)

  const activeCount = recipes.filter((r) => r.active).length

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Receitas de Lavagem</h1>
          <p className="text-sm text-white/40 mt-1">
            {activeCount} receita(s) ativa(s) de {recipes.length} cadastrada(s)
          </p>
        </div>
        <RecipeFormDialog unitId={unitId} mode="create" />
      </div>

      <RecipeList unitId={unitId} recipes={recipes} />
    </div>
  )
}
