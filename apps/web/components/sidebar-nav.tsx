"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, PlusCircle, ClipboardList, UserCog } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@workspace/ui/lib/utils"

const AUTH_PATHS = ["/login", "/register", "/"]

type NavItem = {
  href: string
  label: string
  icon: React.ElementType
  requiresAuth?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: "/feed", label: "Início", icon: Home, requiresAuth: true },
  { href: "/listings/new", label: "Novo anúncio", icon: PlusCircle, requiresAuth: true },
  { href: "/profile", label: "Meus anúncios", icon: ClipboardList, requiresAuth: true },
  { href: "/profile/edit", label: "Editar perfil", icon: UserCog, requiresAuth: true },
]

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SidebarNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (AUTH_PATHS.some((p) => p === "/" ? pathname === "/" : pathname.startsWith(p))) return null

  const allowedItems = NAV_ITEMS.filter((item) =>
    item.requiresAuth ? Boolean(user) : true,
  )

  const isChat = pathname === "/profile/chats"

  return (
    <aside className={cn(
      "hidden md:flex shrink-0 border-r border-border/60 bg-white transition-all duration-300",
      isChat ? "w-[68px]" : "w-60"
    )}>
      <nav className={cn(
        "flex h-full flex-col gap-1 py-5 w-full",
        isChat ? "px-2 items-center" : "px-3"
      )}>
        {!isChat && (
          <p className="px-3 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Menu
          </p>
        )}

        {allowedItems.map((item) => {
          const Icon = item.icon
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isChat ? item.label : undefined}
              className={cn(
                "flex items-center rounded-lg transition-colors group",
                isChat ? "justify-center size-10 mb-2" : "gap-3 px-3 py-2 text-sm",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
            >
              <Icon className={cn("shrink-0", isChat ? "size-5" : "size-4", active ? "text-primary" : "")} />
              {!isChat && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
