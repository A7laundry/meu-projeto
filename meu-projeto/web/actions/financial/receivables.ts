'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Receivable } from '@/types/financial'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function listReceivables(unitId: string): Promise<Receivable[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('receivables')
    .select(`*, client:clients(id, name)`)
    .eq('unit_id', unitId)
    .order('due_date')

  return (data ?? []).map((r) => ({
    ...r,
    client_name: r.client?.name ?? null,
  })) as Receivable[]
}

export async function markReceivablePaid(
  id: string,
  unitId: string,
): Promise<ActionResult> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('receivables')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', id)
    .eq('unit_id', unitId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/financial`)
  return { success: true, data: undefined }
}

export async function createReceivableFromQuote(
  unitId: string,
  quoteId: string,
  clientId: string,
  clientName: string,
  amount: number,
  dueDate: string,
): Promise<ActionResult<Receivable>> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('receivables')
    .insert({
      unit_id: unitId,
      client_id: clientId,
      quote_id: quoteId,
      description: `Orçamento aprovado — ${clientName}`,
      amount,
      due_date: dueDate,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/financial`)
  return { success: true, data: data as Receivable }
}
