'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ClientStats, CrmNote } from '@/types/crm'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const noteSchema = z.object({
  category: z.enum(['visit', 'call', 'email', 'other']),
  content: z.string().min(3, 'Nota deve ter ao menos 3 caracteres'),
})

export async function listClientNotes(clientId: string, limit = 10): Promise<CrmNote[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('crm_notes')
    .select(`*, author:staff(id, name)`)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map((n) => ({
    ...n,
    author_name: n.author?.name ?? null,
  })) as CrmNote[]
}

export async function createCrmNote(
  clientId: string,
  unitId: string,
  formData: FormData,
): Promise<ActionResult<CrmNote>> {
  const raw = {
    category: formData.get('category') as string,
    content: formData.get('content') as string,
  }

  const parsed = noteSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('crm_notes')
    .insert({ ...parsed.data, client_id: clientId, unit_id: unitId })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/clients/${clientId}`)
  return { success: true, data: data as CrmNote }
}

export async function getClientStats(
  clientId: string,
  unitId: string,
): Promise<ClientStats> {
  const supabase = createAdminClient()

  // Busca comandas do cliente via client_name (simplificado — Wave 2 usa client_id FK)
  const { data: quotes } = await supabase
    .from('quotes')
    .select('total, created_at, status')
    .eq('client_id', clientId)
    .eq('unit_id', unitId)
    .eq('status', 'approved')

  const totalOrders = quotes?.length ?? 0
  const totalSpent = (quotes ?? []).reduce((sum, q) => sum + Number(q.total), 0)
  const avgTicket = totalOrders > 0 ? totalSpent / totalOrders : 0
  const lastOrderAt =
    (quotes ?? []).length > 0
      ? [...(quotes ?? [])].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0].created_at
      : null

  return { totalOrders, totalSpent, avgTicket, lastOrderAt }
}
