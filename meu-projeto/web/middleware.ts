import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { UserRole } from '@/types/auth'

// Rotas públicas — sem autenticação
const PUBLIC_ROUTES = ['/login', '/auth/error']

// Mapa de rotas protegidas → roles permitidos
const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  '/director': ['director'],
  '/unit': ['director', 'unit_manager'],
  '/sector': ['operator'],
  '/driver': ['driver'],
  '/client': ['store', 'customer'],
  '/tv': ['director', 'unit_manager'], // Painel TV — acesso gerencial
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
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, active')
      .eq('id', user.id)
      .single()

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
