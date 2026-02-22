import { listAllUsers } from '@/actions/staff/director-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { CreateUserModal, EditUserSheet, ToggleUserButton } from '@/components/domain/director/user-management-forms'
import type { UserRole } from '@/types/auth'

// ─── Role metadata ────────────────────────────────────────────────────────────

const ROLE_META: Record<UserRole, { label: string; color: string }> = {
  director:     { label: 'Director',     color: '#d6b25e' },
  unit_manager: { label: 'Ger. Unidade', color: 'rgba(96,165,250,0.9)' },
  operator:     { label: 'Operador',     color: 'rgba(52,211,153,0.9)' },
  driver:       { label: 'Motorista',    color: 'rgba(251,191,36,0.9)' },
  sdr:          { label: 'SDR',          color: 'rgba(167,139,250,0.9)' },
  closer:       { label: 'Closer',       color: 'rgba(167,139,250,0.9)' },
  store:        { label: 'Loja',         color: 'rgba(148,163,184,0.7)' },
  customer:     { label: 'Cliente',      color: 'rgba(148,163,184,0.7)' },
  copywriter:   { label: 'Copywriter',   color: 'rgba(148,163,184,0.7)' },
}

// ─── Permission matrix ────────────────────────────────────────────────────────

const MODULES = ['Dashboard', 'Ordens', 'NPS', 'Comercial', 'TV', 'Usuários']

const PERMISSIONS: Record<string, boolean[]> = {
  director:     [true,  true,  true,  true,  true,  true ],
  unit_manager: [true,  true,  true,  false, true,  false],
  operator:     [false, true,  false, false, false, false],
  sdr:          [false, false, false, true,  false, false],
  closer:       [false, false, false, true,  false, false],
  driver:       [false, true,  false, false, false, false],
  store:        [false, true,  false, false, false, false],
  customer:     [false, false, false, false, false, false],
  copywriter:   [false, false, false, true,  false, false],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAllUnits() {
  const admin = createAdminClient()
  const { data } = await admin
    .from('units')
    .select('id, name')
    .eq('active', true)
    .order('name')
  return (data ?? []) as { id: string; name: string }[]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; unit_id?: string; status?: string }>
}) {
  const params = await searchParams

  const filters: { role?: UserRole; unit_id?: string; active?: boolean } = {}
  if (params.role && params.role !== 'all')     filters.role = params.role as UserRole
  if (params.unit_id && params.unit_id !== 'all') filters.unit_id = params.unit_id
  if (params.status === 'active')   filters.active = true
  if (params.status === 'inactive') filters.active = false

  const [users, units] = await Promise.all([listAllUsers(filters), getAllUnits()])

  // Counts
  const totalActive   = users.filter(u => u.active).length
  const totalInactive = users.filter(u => !u.active).length

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#d6b25e]/40 font-semibold mb-1">
            Gestão Central
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Usuários da Rede
          </h1>
          <p className="text-sm text-white/35 mt-1">
            {users.length} usuários · {totalActive} ativos · {totalInactive} inativos
          </p>
        </div>
        <CreateUserModal units={units} />
      </div>

      {/* ── Filters ── */}
      <form method="GET" className="flex flex-wrap gap-2">
        <select
          name="role"
          defaultValue={params.role ?? 'all'}
          className="px-3 py-1.5 rounded-lg text-sm text-white/70 bg-white/05 border border-white/08 focus:outline-none focus:border-[#d6b25e]/40 transition-colors"
          onChange={(e) => { const f = new FormData(); f.set('role', e.target.value); }}
        >
          <option value="all" className="bg-[#07070a]">Todos os roles</option>
          {Object.entries(ROLE_META).map(([v, m]) => (
            <option key={v} value={v} className="bg-[#07070a]">{m.label}</option>
          ))}
        </select>

        <select
          name="unit_id"
          defaultValue={params.unit_id ?? 'all'}
          className="px-3 py-1.5 rounded-lg text-sm text-white/70 bg-white/05 border border-white/08 focus:outline-none focus:border-[#d6b25e]/40 transition-colors"
        >
          <option value="all" className="bg-[#07070a]">Todas as unidades</option>
          {units.map(u => (
            <option key={u.id} value={u.id} className="bg-[#07070a]">{u.name}</option>
          ))}
        </select>

        <select
          name="status"
          defaultValue={params.status ?? 'all'}
          className="px-3 py-1.5 rounded-lg text-sm text-white/70 bg-white/05 border border-white/08 focus:outline-none focus:border-[#d6b25e]/40 transition-colors"
        >
          <option value="all" className="bg-[#07070a]">Todos os status</option>
          <option value="active" className="bg-[#07070a]">Ativos</option>
          <option value="inactive" className="bg-[#07070a]">Inativos</option>
        </select>

        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg text-sm text-white/50 bg-white/04 border border-white/08 hover:bg-white/08 hover:text-white/80 transition-colors"
        >
          Filtrar
        </button>
      </form>

      {/* ── User table ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Table header */}
        <div
          className="grid grid-cols-[1fr_140px_160px_90px_72px] px-4 py-2.5 text-[10px] uppercase tracking-widest font-semibold"
          style={{ background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="text-white/30">Nome</span>
          <span className="text-white/30">Role</span>
          <span className="text-white/30">Unidade</span>
          <span className="text-white/30">Status</span>
          <span className="text-white/30 text-right">Ações</span>
        </div>

        {/* Rows */}
        {users.length === 0 && (
          <div className="px-4 py-12 text-center text-white/25 text-sm">
            Nenhum usuário encontrado com os filtros aplicados.
          </div>
        )}

        {users.map((user, i) => {
          const meta = ROLE_META[user.role] ?? { label: user.role, color: 'rgba(148,163,184,0.7)' }
          return (
            <div
              key={user.id}
              className="grid grid-cols-[1fr_140px_160px_90px_72px] px-4 py-3 items-center transition-colors hover:bg-white/02"
              style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
            >
              {/* Nome */}
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/85 truncate">{user.full_name}</p>
              </div>

              {/* Role */}
              <div>
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{
                    color: meta.color,
                    background: `${meta.color.replace('0.9)', '0.1)').replace('0.7)', '0.08)')}`,
                    border: `1px solid ${meta.color.replace('0.9)', '0.2)').replace('0.7)', '0.15)')}`,
                  }}
                >
                  {meta.label}
                </span>
              </div>

              {/* Unidade */}
              <div>
                <span className="text-sm text-white/40 truncate block">
                  {user.units?.name ?? '—'}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${user.active ? 'bg-emerald-400' : 'bg-white/20'}`}
                />
                <span className={`text-xs ${user.active ? 'text-emerald-400/80' : 'text-white/25'}`}>
                  {user.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-1">
                <EditUserSheet user={user} units={units} />
                <ToggleUserButton userId={user.id} active={user.active} />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Permission matrix ── */}
      <details className="group">
        <summary
          className="flex items-center gap-2 cursor-pointer select-none list-none py-3 px-4 rounded-xl transition-colors hover:bg-white/03"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="text-[#d6b25e]/60 text-sm transition-transform group-open:rotate-90">▶</span>
          <span className="text-sm font-medium text-white/60 group-hover:text-white/80 transition-colors">
            Matriz de Permissões
          </span>
          <span className="ml-auto text-xs text-white/25">role × módulo</span>
        </summary>

        <div
          className="mt-2 rounded-xl overflow-x-auto"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest font-semibold text-white/30 min-w-[140px]">
                  Role
                </th>
                {MODULES.map(m => (
                  <th key={m} className="px-4 py-2.5 text-[10px] uppercase tracking-widest font-semibold text-white/30 text-center whitespace-nowrap">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(PERMISSIONS).map(([role, perms], i) => {
                const meta = ROLE_META[role as UserRole]
                return (
                  <tr
                    key={role}
                    style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
                    className="hover:bg-white/02 transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{
                          color: meta.color,
                          background: `${meta.color.replace('0.9)', '0.08)').replace('0.7)', '0.06)')}`,
                        }}
                      >
                        {meta.label}
                      </span>
                    </td>
                    {perms.map((allowed, j) => (
                      <td key={j} className="px-4 py-2.5 text-center">
                        {allowed ? (
                          <span className="text-emerald-400 text-base">✓</span>
                        ) : (
                          <span className="text-white/15">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </details>

    </div>
  )
}
