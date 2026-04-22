"use client"

import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import { LogOut, Plus, User, Search, MessageCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { MobileSidebarNav } from "@/components/mobile-sidebar-nav"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"

function ToothIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C9 2 6 4 6 7c0 1.5.3 3 .8 4.5C7.5 14 8 16.5 8 19c0 1.7 1.3 3 3 3 .8 0 1.5-.6 1.5-1.4C12.5 19 13 17 13 17s.5 2-.5 3.6c0 .8.7 1.4 1.5 1.4 1.7 0 3-1.3 3-3 0-2.5.5-5 1.2-7.5C18.7 10 19 8.5 19 7c0-3-3-5-7-5z" />
    </svg>
  )
}

function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [value, setValue] = useState(searchParams.get("search") ?? "")

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set("search", value.trim())
    } else {
      params.delete("search")
    }
    params.delete("page")
    const qs = params.toString()
    router.push(pathname === "/" ? (qs ? `/?${qs}` : "/") : `/?${qs}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar equipamentos, materiais..."
        className="pl-9 bg-white/70 border-border/60 focus:bg-white h-9 text-sm"
      />
    </form>
  )
}

export function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [hasUnread, setHasUnread] = useState(false)

  // Desativa o ponto vermelho se o usuário entrar na aba de chats
  useEffect(() => {
    if (pathname === "/profile/chats") {
      setHasUnread(false)
    }
  }, [pathname])

  // Global WebSocket Listener para notificações e badge, syncando novas salas a cada 15s
  useEffect(() => {
    if (!user) return
    let client: import("@stomp/stompjs").Client | null = null
    let syncInterval: NodeJS.Timeout
    const subscribedRooms = new Set<string>()

    import("@stomp/stompjs").then(({ Client }) => {
      import("sockjs-client").then(({ default: SockJS }) => {
        
        client = new Client({
          webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
          reconnectDelay: 2000,
          onConnect: () => {
            // Função para buscar e assinar novas salas
            const syncRooms = () => {
              import("@/lib/api").then(({ chatApi }) => {
                chatApi.getUserRooms(user.userId).then((rooms) => {
                  rooms.forEach((r) => {
                    if (!subscribedRooms.has(r.id)) {
                      subscribedRooms.add(r.id)
                      client!.subscribe(`/topic/room/${r.id}`, (msg) => {
                        const parsed = JSON.parse(msg.body)
                        if (parsed.senderId !== user.userId) {
                          if (window.location.pathname !== "/profile/chats") {
                            setHasUnread(true)
                            import("sonner").then(({ toast }) => {
                              toast.success(`Nova mensagem em ${r.listingTitle || "anúncio"}!`, {
                                description: parsed.content.startsWith("[IMAGEM]") ? "🖼️ Imagem recebida" : parsed.content,
                                duration: 5000,
                              })
                            })
                          }
                        }
                      })
                    }
                  })
                }).catch(console.error)
              })
            }

            syncRooms()
            syncInterval = setInterval(syncRooms, 10000) // Verifica a cada 10s se alguem novo abriu chat
          },
        })
        client.activate()
      })
    })

    return () => {
      clearInterval(syncInterval)
      if (client) client.deactivate()
    }
  }, [user])

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">

        {/* Mobile menu */}
        <div className="flex items-center gap-3 md:hidden">
          <MobileSidebarNav />
        </div>

        {/* Logo */}
        <Link href={user ? "/feed" : "/"} className="flex items-center gap-2 shrink-0 group">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:bg-primary/90 transition-colors">
            <ToothIcon className="size-4.5" />
          </div>
          <span className="hidden sm:block text-base font-semibold tracking-tight text-foreground">
            OdontoTrade
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 hidden sm:flex justify-center">
           <Suspense>
            <SearchBar />
          </Suspense>
        </div>

        <div className="flex-1 sm:hidden" />

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              <Button asChild size="sm" className="gap-1.5 shadow-sm">
                <Link href="/listings/new">
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">Anunciar</span>
                </Link>
              </Button>

              <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-primary relative" title="Minhas Mensagens">
                <Link href="/profile/chats">
                  <MessageCircle className="size-5" />
                  {hasUnread && (
                    <span className="absolute top-1 right-1 size-2.5 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </Link>
              </Button>

              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-2 rounded-full border border-border/60 bg-white px-3 py-1.5 text-sm hover:bg-muted/60 transition-colors"
              >
                <div className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <User className="size-3" />
                </div>
                <span className="text-foreground font-medium max-w-[120px] truncate">{user.name}</span>
              </Link>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" title="Sair" className="text-muted-foreground hover:text-foreground size-8">
                    <LogOut className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sair da conta</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja sair? Você precisará fazer login novamente para acessar sua conta.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={logout}>Sair</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button size="sm" asChild className="shadow-sm">
                <Link href="/register">Criar conta</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden px-4 pb-2">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>
    </header>
  )
}
