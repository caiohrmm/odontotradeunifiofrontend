"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@workspace/ui/lib/utils"

const AUTH_PATHS = ["/login", "/register"]

type NavItem = {
  href: string
  label: string
  requiresAuth?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Início" },
  { href: "/listings/new", label: "Novo anúncio", requiresAuth: true },
  { href: "/profile", label: "Meus anúncios", requiresAuth: true },
  { href: "/profile/edit", label: "Editar perfil", requiresAuth: true },
]

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SidebarNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p))
  if (isAuthPage) return null

  const allowedItems = NAV_ITEMS.filter((item) =>
    item.requiresAuth ? Boolean(user) : true,
  )

  return (
    <aside className="hidden md:flex w-64 shrink-0 border-r bg-background">
      <nav className="flex h-full flex-col gap-2 px-3 py-4">
        <div className="px-2 text-xs font-medium text-muted-foreground">
          Navegação
        </div>

        <div className="flex flex-col gap-1">
          {allowedItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
                isActive(pathname, item.href)
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  )
}

