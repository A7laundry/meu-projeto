'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'
import { z } from 'zod'
import type { Receivable } from '@/types/financial'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const markPaidSchema = z.object({
  id: z.string().uuid('ID do recebível inválido'),
  unitId: z.string().uuid('ID da unidade inválido'),
})

const createReceivableSchema = z.object({
  unitId: z.string().uuid('ID da unidade inválido'),
  quoteId: z.string().uuid('ID do orçamento inválido'),
  clientId: z.string().uuid('ID do cliente inválido'),
  clientName: z.string().min(1, 'Nome do cliente é obrigatório'),
  amount: z.number().positive('Valor deve ser maior que zero'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
})

export async function listReceivables(unitId: string): Promise<Receivable[]> {
  await requireRole(['unit_manager', 'director', 'store'])
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
  const parsed = markPaidSchema.safeParse({ id, unitId })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { user } = await requireRole(['unit_manager', 'director', 'store'])
  const supabase = createAdminClient()

  // TODO: Migração necessária — adicionar coluna `paid_by UUID REFERENCES auth.users(id)` na tabela receivables
  // Enquanto a coluna não existir, registramos quem pagou no campo notes
  const { data: existing } = await supabase
    .from('receivables')
    .select('notes')
    .eq('id', id)
    .eq('unit_id', unitId)
    .single()

  const paidNote = `[Pago por: ${user.id} em ${new Date().toISOString()}]`
  const updatedNotes = existing?.notes
    ? `${existing.notes}\n${paidNote}`
    : paidNote

  const { error } = await supabase
    .from('receivables')
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
  revalidatePath('/director/financial/receivables')
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
  const parsed = createReceivableSchema.safeParse({ unitId, quoteId, clientId, clientName, amount, dueDate })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  await requireRole(['unit_manager', 'director', 'store'])
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
