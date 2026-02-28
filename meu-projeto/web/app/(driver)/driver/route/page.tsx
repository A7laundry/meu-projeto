import { getUser } from '@/lib/auth/get-user'
import { getDriverManifestsToday } from '@/actions/manifests/driver'
import RouteClient from './route-client'

export default async function DriverRoutePage() {
  const [user, manifests] = await Promise.all([
    getUser(),
    getDriverManifestsToday(),
  ])

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const firstName = user?.full_name?.split(' ')[0] ?? 'Motorista'

  if (manifests.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#60a5fa]/40 font-semibold mb-1 capitalize">{today}</p>
          <h1 className="text-xl font-bold text-white">Ola, {firstName}</h1>
        </div>
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <p className="text-4xl mb-3">&#x1F69A;</p>
          <p className="text-white/75 font-semibold mb-1">Nenhum romaneio para hoje</p>
          <p className="text-sm text-white/35">
            Entre em contato com o gerente de unidade para verificar sua escala.
          </p>
        </div>
      </div>
    )
  }

  return <RouteClient firstName={firstName} today={today} manifests={manifests} />
}
