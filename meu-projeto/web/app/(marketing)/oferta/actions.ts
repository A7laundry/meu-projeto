'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

export async function submitOfertaForm(formData: FormData): Promise<void> {
  const name = (formData.get('name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()

  if (!name || name.length < 2 || !phone || phone.length < 8) {
    redirect('/oferta?error=dados')
  }

  try {
    const supabase = createAdminClient()
    await supabase.from('leads').insert({
      name,
      company: (formData.get('company') as string)?.trim() || null,
      phone,
      email: (formData.get('email') as string)?.trim() || null,
      type: formData.get('type') as string || 'business',
      source: 'oferta',
      estimated_monthly_value: 150,
      notes: 'Lead da página de oferta especial (primeiras 50 empresas)',
    })
  } catch {
    redirect('/oferta?error=server')
  }

  redirect('/oferta?ok=1')
}
