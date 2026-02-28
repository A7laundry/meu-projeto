export const dynamic = 'force-dynamic'

import { getUser } from '@/lib/auth/get-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { OrdersClient } from './orders-client'
import type { Order } from '@/types/order'

/* ---- Busca de dados ---------------------------------------------------- */

async function getClientRecord(profileId: string): Promise<{ id: string; name: string; unitPhone: string | null } | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('clients').select('id, name, units(phone)')
    .eq('profile_id', profileId).maybeSingle()
  if (!data) return null
  const raw = data as { id: string; name: string; units?: { phone?: string | null } | null }
  return { id: raw.id, name: raw.name, unitPhone: raw.units?.phone ?? null }
}

async function getClientOrders(clientId: string): Promise<Order[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('orders').select(`*, items:order_items(*), events:order_events(*)`)
    .eq('client_id', clientId).order('created_at', { ascending: false }).limit(50)
  return (data ?? []) as Order[]
}

/* ---- Pagina principal -------------------------------------------------- */

export default async function ClientOrdersPage() {
  const user = await getUser()
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-6">
          <p className="text-4xl mb-4">🔒</p>
          <p className="font-semibold text-white/75">Sess\u00e3o expirada</p>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Fa\u00e7a login novamente para continuar.
          </p>
        </div>
      </div>
    )
  }

  const clientRecord = await getClientRecord(user.id)
  const orders = clientRecord ? await getClientOrders(clientRecord.id) : []
  const firstName = (clientRecord?.name ?? user.full_name ?? '').split(' ')[0] || 'Cliente'

  const rawPhone = clientRecord?.unitPhone ?? null
  const unitWa   = rawPhone ? '55' + rawPhone.replace(/\D/g, '') : null

  return (
    <OrdersClient
      clientId={clientRecord?.id ?? null}
      firstName={firstName}
      unitWa={unitWa}
      initialOrders={orders}
    />
  )
}
