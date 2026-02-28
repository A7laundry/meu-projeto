'use server'

import { requireRole } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Upload de fotos de evidência para uma comanda (triagem).
 *
 * IMPORTANTE: O bucket `order-photos` deve ser criado no Supabase Dashboard:
 *   1. Acesse Storage > Create Bucket
 *   2. Nome: order-photos
 *   3. Public: true (para leitura pública das URLs)
 *   4. Adicione policy de INSERT para authenticated users
 */
export async function uploadOrderPhotos(
  orderId: string,
  formData: FormData
): Promise<{ success: boolean; urls: string[]; error?: string }> {
  try {
    const { user } = await requireRole(['operator', 'unit_manager'])
    const supabase = createAdminClient()

    const files = formData.getAll('photos') as File[]

    if (files.length === 0) {
      return { success: true, urls: [] }
    }

    if (files.length > 5) {
      return { success: false, urls: [], error: 'Maximo de 5 fotos permitido' }
    }

    const urls: string[] = []

    for (const file of files) {
      // Validar tipo
      if (!file.type.startsWith('image/')) continue

      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) continue

      const ext = file.name.split('.').pop() || 'jpg'
      const path = `orders/${orderId}/sorting/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage
        .from('order-photos')
        .upload(path, file, { contentType: file.type })

      if (!error) {
        const { data: urlData } = supabase.storage
          .from('order-photos')
          .getPublicUrl(path)
        urls.push(urlData.publicUrl)
      }
    }

    // Salvar referencias na tabela order_events como evidencia
    if (urls.length > 0) {
      await supabase.from('order_events').insert({
        order_id: orderId,
        event_type: 'photo_evidence',
        operator_id: user.id,
        notes: JSON.stringify(urls),
      })
    }

    return { success: true, urls }
  } catch (error) {
    return {
      success: false,
      urls: [],
      error: error instanceof Error ? error.message : 'Erro ao enviar fotos',
    }
  }
}
