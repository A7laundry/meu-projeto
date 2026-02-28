import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole, UserProfile } from '@/types/auth'

// ---------------------------------------------------------------------------
// Tipos de retorno
// ---------------------------------------------------------------------------

export interface AuthContext {
  /** Usuário autenticado do Supabase Auth (id, email, etc.) */
  user: { id: string; email?: string }
  /** Profile completo do banco (role, unit_id, active, etc.) */
  profile: UserProfile
}

// ---------------------------------------------------------------------------
// requireAuth — verifica se existe sessão válida e profile ativo
// ---------------------------------------------------------------------------

/**
 * Obtém o usuário autenticado via cookie de sessão e carrega o profile.
 *
 * Usa `createClient()` (anon key + cookies) para ler a sessão real do
 * navegador, e `createAdminClient()` (service role) para buscar o profile
 * na tabela `profiles` sem depender de RLS.
 *
 * @throws Error se não autenticado, profile inexistente, ou conta inativa.
 */
export async function requireAuth(): Promise<AuthContext> {
  // 1. Sessão do usuário — NUNCA usar adminClient aqui
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Não autenticado')
  }

  // 2. Profile — admin bypassa RLS para garantir leitura
  const admin = createAdminClient()
  const { data: profile, error } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    throw new Error('Profile não encontrado')
  }

  const typedProfile = profile as UserProfile

  // 3. Conta ativa?
  if (!typedProfile.active) {
    throw new Error('Conta desativada')
  }

  return {
    user: { id: user.id, email: user.email },
    profile: typedProfile,
  }
}

// ---------------------------------------------------------------------------
// requireRole — verifica se o role do usuário está na lista permitida
// ---------------------------------------------------------------------------

/**
 * Verifica autenticação E se o role do usuário está entre os permitidos.
 *
 * @param allowedRoles - Lista de roles aceitos para esta operação.
 * @throws Error se não autenticado, inativo, ou role não autorizado.
 *
 * @example
 * ```ts
 * const { profile } = await requireRole(['director', 'unit_manager'])
 * ```
 */
export async function requireRole(
  allowedRoles: UserRole[],
): Promise<AuthContext> {
  const ctx = await requireAuth()

  if (!allowedRoles.includes(ctx.profile.role)) {
    throw new Error(
      `Acesso negado: role "${ctx.profile.role}" não autorizado. ` +
        `Roles permitidos: ${allowedRoles.join(', ')}`,
    )
  }

  return ctx
}

// ---------------------------------------------------------------------------
// requireUnitAccess — verifica acesso a uma unidade específica
// ---------------------------------------------------------------------------

/**
 * Verifica autenticação, role (opcional) e acesso a uma unidade.
 *
 * - `director` tem acesso a QUALQUER unidade (multi-unit).
 * - Demais roles precisam ter `profile.unit_id === unitId`.
 *
 * @param unitId - UUID da unidade que o usuário quer acessar.
 * @param allowedRoles - Roles permitidos (opcional; se omitido, qualquer role autenticado).
 * @throws Error se não autenticado, role inválido, ou unidade não corresponde.
 *
 * @example
 * ```ts
 * const { profile } = await requireUnitAccess(unitId, ['unit_manager', 'operator'])
 * ```
 */
export async function requireUnitAccess(
  unitId: string,
  allowedRoles?: UserRole[],
): Promise<AuthContext> {
  const ctx = allowedRoles
    ? await requireRole(allowedRoles)
    : await requireAuth()

  // Director acessa qualquer unidade
  if (ctx.profile.role === 'director') {
    return ctx
  }

  // Demais roles: unit_id deve bater
  if (ctx.profile.unit_id !== unitId) {
    throw new Error(
      `Acesso negado: você não pertence à unidade "${unitId}"`,
    )
  }

  return ctx
}
