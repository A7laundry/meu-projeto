import { requireUser } from '@/lib/auth/get-user'
import { listRecipes } from '@/actions/recipes/crud'
import { SortingPageClient } from './page-client'

export default async function SortingPage() {
  const user = await requireUser()
  const recipes = await listRecipes(user.unit_id!).catch(() => [])

  return (
    <SortingPageClient
      unitId={user.unit_id!}
      operatorName={user.full_name}
      recipes={recipes}
    />
  )
}
