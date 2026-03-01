'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'

export interface AuditLogRow {
  id: string
  user_name: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  unit_id: string | null
}

export async function listAuditLogs(filters?: {
  days?: number
  action?: string
  unitId?: string
}): Promise<AuditLogRow[]> {
  await requireRole(['director', 'unit_manager'])

  const admin = createAdminClient()
  const days = filters?.days ?? 7

  let query = admin
    .from('audit_logs')
    .select('id, user_name, action, entity_type, entity_id, metadata, created_at, unit_id')
    .gte('created_at', new Date(Date.now() - days * 86400000).toISOString())
    .order('created_at', { ascending: false })
    .limit(200)

  if (filters?.action) {
    query = query.eq('action', filters.action)
  }
  if (filters?.unitId) {
    query = query.eq('unit_id', filters.unitId)
  }

  const { data } = await query
  return (data ?? []) as AuditLogRow[]
}
