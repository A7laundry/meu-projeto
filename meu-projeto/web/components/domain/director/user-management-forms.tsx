'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { createUserDirector, updateUserDirector, toggleUserDirector } from '@/actions/staff/director-admin'
import type { UserWithUnit } from '@/actions/staff/director-admin'
import type { UserRole } from '@/types/auth'

const ALL_ROLES: { value: UserRole; label: string }[] = [
  { value: 'director',     label: 'Director' },
  { value: 'unit_manager', label: 'Gerente de Unidade' },
  { value: 'operator',     label: 'Operador' },
  { value: 'driver',       label: 'Motorista' },
  { value: 'store',        label: 'Loja' },
  { value: 'customer',     label: 'Cliente' },
  { value: 'sdr',          label: 'SDR' },
  { value: 'closer',       label: 'Closer' },
  { value: 'copywriter',   label: 'Copywriter' },
]

const inputCls =
  'w-full rounded-lg px-3 py-2 text-sm text-white bg-white/05 border border-white/10 focus:outline-none focus:border-[#d6b25e]/50 focus:ring-1 focus:ring-[#d6b25e]/30 placeholder:text-white/25 transition-colors'

const labelCls = 'block text-xs font-medium text-white/50 mb-1'

const btnGold =
  'px-4 py-2 rounded-lg text-sm font-semibold bg-[#d6b25e] text-black hover:bg-[#e8cc7e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

const btnGhost =
  'px-4 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/05 transition-colors'

// ─── CreateUserModal ─────────────────────────────────────────────────────────

export function CreateUserModal({
  units,
}: {
  units: { id: string; name: string }[]
}) {
  const [open, setOpen]     = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [isPending, start]  = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    start(async () => {
      try {
        await createUserDirector(fd)
        setOpen(false)
        ;(e.target as HTMLFormElement).reset()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao criar usuário')
      }
    })
  }

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className={btnGold}
      >
        + Novo Usuário
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-md mx-4 rounded-xl p-6"
            style={{
              background: 'linear-gradient(160deg, rgba(214,178,94,0.05) 0%, rgba(5,5,8,0.98) 100%)',
              border: '1px solid rgba(214,178,94,0.15)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#d6b25e]/40 font-semibold mb-1">
                  Gestão de Usuários
                </p>
                <h2 className="text-lg font-bold text-white">Novo Usuário</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>Nome completo</label>
                <input name="full_name" required placeholder="Ex: João Silva" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Email</label>
                <input name="email" type="email" required placeholder="joao@empresa.com" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Senha inicial</label>
                <input name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Role</label>
                  <select name="role" required className={inputCls}>
                    <option value="" className="bg-[#07070a]">Selecionar...</option>
                    {ALL_ROLES.map(r => (
                      <option key={r.value} value={r.value} className="bg-[#07070a]">{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Unidade</label>
                  <select name="unit_id" className={inputCls}>
                    <option value="" className="bg-[#07070a]">Sem unidade</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id} className="bg-[#07070a]">{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={isPending} className={btnGold}>
                  {isPending ? 'Criando...' : 'Criar Usuário'}
                </button>
                <button type="button" onClick={() => setOpen(false)} className={btnGhost}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── EditUserSheet ────────────────────────────────────────────────────────────

export function EditUserSheet({
  user,
  units,
}: {
  user: UserWithUnit
  units: { id: string; name: string }[]
}) {
  const [open, setOpen]    = useState(false)
  const [error, setError]  = useState<string | null>(null)
  const [isPending, start] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    start(async () => {
      try {
        await updateUserDirector(user.id, fd)
        setOpen(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao atualizar')
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Editar usuário"
        className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-[#d6b25e] hover:bg-[#d6b25e]/08 transition-all text-sm"
      >
        ✏
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div
            className="relative flex flex-col w-full max-w-sm h-full overflow-y-auto"
            style={{
              background: 'linear-gradient(180deg, #060609 0%, #07070a 100%)',
              borderLeft: '1px solid rgba(214,178,94,0.12)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/05">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#d6b25e]/40 font-semibold mb-0.5">
                  Editar
                </p>
                <h2 className="text-base font-bold text-white truncate max-w-[200px]">
                  {user.full_name}
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4">
              <div>
                <label className={labelCls}>Nome completo</label>
                <input
                  name="full_name"
                  required
                  defaultValue={user.full_name}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Role</label>
                <select name="role" defaultValue={user.role} className={inputCls}>
                  {ALL_ROLES.map(r => (
                    <option key={r.value} value={r.value} className="bg-[#07070a]">{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Unidade</label>
                <select name="unit_id" defaultValue={user.unit_id ?? ''} className={inputCls}>
                  <option value="" className="bg-[#07070a]">Sem unidade</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id} className="bg-[#07070a]">{u.name}</option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={isPending} className={btnGold}>
                  {isPending ? 'Salvando...' : 'Salvar'}
                </button>
                <button type="button" onClick={() => setOpen(false)} className={btnGhost}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// ─── ToggleUserButton ─────────────────────────────────────────────────────────

export function ToggleUserButton({
  userId,
  active,
}: {
  userId: string
  active: boolean
}) {
  const [isPending, start] = useTransition()
  const [optimisticActive, setOptimisticActive] = useOptimistic(active)

  const handleClick = () => {
    const next = !optimisticActive
    start(async () => {
      setOptimisticActive(next)
      try {
        await toggleUserDirector(userId, next)
      } catch {
        // revert happens automatically when transition ends
      }
    })
  }

  return optimisticActive ? (
    <button
      onClick={handleClick}
      disabled={isPending}
      title="Desativar usuário"
      className="w-7 h-7 flex items-center justify-center rounded-md text-red-400/50 hover:text-red-400 hover:bg-red-400/08 transition-all text-sm disabled:opacity-40"
    >
      ⊘
    </button>
  ) : (
    <button
      onClick={handleClick}
      disabled={isPending}
      title="Ativar usuário"
      className="w-7 h-7 flex items-center justify-center rounded-md text-emerald-400/50 hover:text-emerald-400 hover:bg-emerald-400/08 transition-all text-sm disabled:opacity-40"
    >
      ✓
    </button>
  )
}
