'use server'

import { createAdminClient } from '@/lib/supabase/admin'

interface AuditEntry {
  unitId?: string | null
  userId: string
  userName: string
  action: string
  entityType: string
  entityId?: string | null
  metadata?: Record<string, unknown>
}

/**
 * Registra ação no audit log.
 * Fire-and-forget — nunca bloqueia a operação principal.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const admin = createAdminClient()
    await admin.from('audit_logs').insert({
      unit_id: entry.unitId ?? null,
      user_id: entry.userId,
      user_name: entry.userName,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      metadata: entry.metadata ?? {},
    })
  } catch (err) {
    console.error('[audit] Failed to log:', err)
  }
}
