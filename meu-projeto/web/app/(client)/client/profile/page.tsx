export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getClientProfile } from '@/actions/client/update-profile'
import { ProfileForm } from './profile-form'

export default async function ClientProfilePage() {
  const profile = await getClientProfile()

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Meu Perfil</h1>
        <p className="text-sm text-white/40 mt-1">Atualize seus dados de contato</p>
      </div>

      {/* Info card */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-1">Nome</p>
          <p className="text-lg font-semibold text-white/85">{profile.name}</p>
        </div>
        {profile.unitName && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-1">Unidade</p>
            <p className="text-sm text-white/55">{profile.unitName}</p>
          </div>
        )}
      </div>

      {/* Edit form */}
      <ProfileForm
        currentPhone={profile.phone ?? ''}
        currentEmail={profile.email ?? ''}
      />
    </div>
  )
}
