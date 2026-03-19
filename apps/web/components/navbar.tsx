"use client"

import Link from "next/link"
import { LogOut, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@workspace/ui/components/button"
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

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          OdontoTrade
        </Link>

        <div className="flex-1" />

        {user && (
          <div className="flex items-center gap-2">
            <Button asChild size="sm">
              <Link href="/listings/new">
                <Plus className="size-4" />
                <span className="hidden sm:inline">Novo anuncio</span>
              </Link>
            </Button>

            <Link
              href="/profile"
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:block"
            >
              {user.name}
            </Link>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Sair">
                  <LogOut />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sair da conta</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja sair? Voce precisara fazer login novamente para acessar sua conta.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={logout}>Sair</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </header>
  )
}
