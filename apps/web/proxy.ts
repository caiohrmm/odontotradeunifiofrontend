import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rotas sempre públicas (sem redirecionamento)
const PUBLIC_ROUTES = ["/login", "/register", "/"]
// Rotas que autenticados não devem acessar (ex: telas de auth)
const AUTH_ONLY_REDIRECT = ["/login", "/register"]

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth_token")?.value

  const isPublic = PUBLIC_ROUTES.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  )

  // Usuário não autenticado tentando acessar rota protegida
  if (!token && !isPublic) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Usuário autenticado tentando acessar login/register → manda pro feed
  const isAuthOnlyRedirect = AUTH_ONLY_REDIRECT.some((route) =>
    pathname.startsWith(route)
  )
  if (token && isAuthOnlyRedirect) {
    return NextResponse.redirect(new URL("/feed", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico
     * - arquivos públicos com extensão
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)",
  ],
}
