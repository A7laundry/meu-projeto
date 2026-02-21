'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

export async function submitLeadForm(formData: FormData): Promise<void> {
  const name = (formData.get('name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()

  if (!name || name.length < 2 || !phone || phone.length < 8) {
    redirect('/captacao?error=dados')
  }

  try {
    const supabase = createAdminClient()
    await supabase.from('leads').insert({
      name,
      company: (formData.get('company') as string)?.trim() || null,
      phone,
      email: (formData.get('email') as string)?.trim() || null,
      type: formData.get('type') as string || 'business',
      source: 'form',
      estimated_monthly_value: Number(formData.get('estimated_monthly_value') ?? 0),
      notes: (formData.get('how_found') as string)?.trim()
        ? `Como nos encontrou: ${formData.get('how_found')}`
        : null,
    })
  } catch {
    redirect('/captacao?error=server')
  }

  redirect('/captacao?ok=1')
}
