'use client'

import { useState, useTransition } from 'react'
import { updateClientProfile } from '@/actions/client/update-profile'

interface ProfileFormProps {
  currentPhone: string
  currentEmail: string
}

export function ProfileForm({ currentPhone, currentEmail }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updateClientProfile(formData)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error)
      }
    })
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 12,
    color: 'white',
    padding: '14px 16px',
    fontSize: 16,
    width: '100%',
    outline: 'none',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">
          Dados de contato
        </p>

        <div>
          <label className="text-xs text-white/40 block mb-1.5">Telefone</label>
          <input
            name="phone"
            type="tel"
            defaultValue={currentPhone}
            placeholder="(11) 99999-9999"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="text-xs text-white/40 block mb-1.5">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={currentEmail}
            placeholder="seu@email.com"
            style={inputStyle}
          />
        </div>
      </div>

      {error && (
        <p
          className="text-sm rounded-xl px-4 py-2.5"
          style={{
            background: 'rgba(248,113,113,0.10)',
            color: '#fca5a5',
            border: '1px solid rgba(248,113,113,0.22)',
          }}
        >
          {error}
        </p>
      )}

      {success && (
        <p
          className="text-sm rounded-xl px-4 py-2.5 text-center"
          style={{
            background: 'rgba(52,211,153,0.10)',
            color: '#34d399',
            border: '1px solid rgba(52,211,153,0.22)',
          }}
        >
          Dados atualizados com sucesso!
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-14 text-base font-bold rounded-xl transition-all disabled:opacity-50"
        style={{
          background: isPending
            ? 'rgba(255,255,255,0.08)'
            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white',
          border: '1px solid rgba(59,130,246,0.30)',
        }}
      >
        {isPending ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  )
}
