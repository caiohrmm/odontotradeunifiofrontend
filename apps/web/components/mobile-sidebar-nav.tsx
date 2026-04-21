"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@workspace/ui/lib/utils"

const AUTH_PATHS = ["/login", "/register", "/"]

type NavItem = {
  href: string
  label: string
  requiresAuth?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: "/feed", label: "Início", requiresAuth: true },
  { href: "/listings/new", label: "Novo anúncio", requiresAuth: true },
  { href: "/profile", label: "Meus anúncios", requiresAuth: true },
  { href: "/profile/edit", label: "Editar perfil", requiresAuth: true },
]

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function MobileSidebarNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const isAuthPage = AUTH_PATHS.some((p) => p === "/" ? pathname === "/" : pathname.startsWith(p))
  if (isAuthPage) return null

  const allowedItems = NAV_ITEMS.filter((item) =>
    item.requiresAuth ? Boolean(user) : true,
  )

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menu"
        className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background shadow-sm"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <div
            className="absolute left-0 top-14 h-[calc(100vh-3.5rem)] w-72 overflow-y-auto border-r bg-background p-4"
            aria-label="Menu de navegação"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Navegação</div>
              <button
                type="button"
                aria-label="Fechar menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-1">
              {allowedItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
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
          </div>
        </div>
      )}
    </>
  )
}

