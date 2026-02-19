'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Payable } from '@/types/financial'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const payableSchema = z.object({
  description: z.string().min(3, 'Descrição deve ter ao menos 3 caracteres'),
  supplier: z.string().optional(),
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  due_date: z.string().min(1, 'Data de vencimento é obrigatória'),
  category: z.enum(['supplies', 'equipment', 'payroll', 'utilities', 'rent', 'other']),
  notes: z.string().optional(),
})

export async function listPayables(unitId: string): Promise<Payable[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('payables')
    .select('*')
    .eq('unit_id', unitId)
    .order('due_date')

  return (data ?? []) as Payable[]
}

export async function createPayable(
  unitId: string,
  formData: FormData,
): Promise<ActionResult<Payable>> {
  const raw = {
    description: formData.get('description') as string,
    supplier: formData.get('supplier') as string,
    amount: formData.get('amount') as string,
    due_date: formData.get('due_date') as string,
    category: formData.get('category') as string,
    notes: formData.get('notes') as string,
  }

  const parsed = payableSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('payables')
    .insert({ ...parsed.data, unit_id: unitId })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/financial`)
  return { success: true, data: data as Payable }
}

export async function markPayablePaid(
  id: string,
  unitId: string,
): Promise<ActionResult> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('payables')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', id)
    .eq('unit_id', unitId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/financial`)
  return { success: true, data: undefined }
}
