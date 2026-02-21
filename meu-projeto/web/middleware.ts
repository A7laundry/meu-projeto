import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { UserRole } from '@/types/auth'

async function getProfileFromAdmin(userId: string): Promise<{ role: string; active: boolean } | null> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=role,active&limit=1`
  const res = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
  })
  if (!res.ok) return null
  const rows = await res.json()
  return rows[0] ?? null
}

// Rotas públicas — sem autenticação
const PUBLIC_ROUTES = ['/login', '/auth/error', '/captacao']

// Mapa de rotas protegidas → roles permitidos
const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  '/director': ['director'],
  '/unit': ['director', 'unit_manager'],
  '/sector': ['operator'],
  '/driver': ['driver'],
  '/client': ['store', 'customer'],
  '/tv': ['director', 'unit_manager'],
  '/commercial': ['director', 'unit_manager', 'sdr', 'closer'],
  '/copywriter': ['director', 'unit_manager', 'copywriter'],
}

function getRequiredRoles(pathname: string): UserRole[] | null {
  for (const [route, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) return roles
  }
  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignorar arquivos estáticos e API routes internas
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Rotas públicas — liberar direto
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verificar sessão
  const { data: { user } } = await supabase.auth.getUser()

  // Sem sessão → redirecionar para login
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Verificar autorização por role para rotas protegidas
  const requiredRoles = getRequiredRoles(pathname)
  if (requiredRoles) {
    // Usa fetch direto com service role key (Edge Runtime não suporta @supabase/supabase-js)
    const profile = await getProfileFromAdmin(user.id)

    // Perfil inativo ou sem role
    if (!profile || !profile.active) {
      return NextResponse.redirect(new URL('/auth/error', request.url))
    }

    // Role não autorizado para esta rota
    if (!requiredRoles.includes(profile.role as UserRole)) {
      return NextResponse.redirect(new URL('/auth/error', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
