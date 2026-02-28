'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'
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
  await requireRole(['unit_manager', 'director'])
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
  await requireRole(['unit_manager', 'director'])

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
  revalidatePath('/store/financeiro')
  return { success: true, data: data as Payable }
}

export async function markPayablePaid(
  id: string,
  unitId: string,
): Promise<ActionResult> {
  const { user } = await requireRole(['unit_manager', 'director'])
  const supabase = createAdminClient()

  // TODO: Migração necessária — adicionar coluna `paid_by UUID REFERENCES auth.users(id)` na tabela payables
  // Enquanto a coluna não existir, registramos quem pagou no campo notes
  const { data: existing } = await supabase
    .from('payables')
    .select('notes')
    .eq('id', id)
    .eq('unit_id', unitId)
    .single()

  const paidNote = `[Pago por: ${user.id} em ${new Date().toISOString()}]`
  const updatedNotes = existing?.notes
    ? `${existing.notes}\n${paidNote}`
    : paidNote

  const { error } = await supabase
    .from('payables')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      notes: updatedNotes,
    })
    .eq('id', id)
    .eq('unit_id', unitId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/unit/${unitId}/financial`)
  revalidatePath('/store/financeiro')
  return { success: true, data: undefined }
}
