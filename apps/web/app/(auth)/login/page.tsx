"use client"

import React, { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

function isSafeRedirect(path: string) {
  return path.startsWith("/") && !path.startsWith("//")
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const { login } = useAuth()
  const searchParams = useSearchParams()
  const rawFrom = searchParams.get("from") ?? "/feed"
  const redirectTo = isSafeRedirect(rawFrom) ? rawFrom : "/feed"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError(null)
    setIsPending(true)
    try {
      await login(email, password, redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="w-full max-w-sm flex flex-col gap-8">
      {/* Logo mobile */}
      <div className="flex lg:hidden items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4.5">
            <path d="M12 2C9 2 6 4 6 7c0 1.5.3 3 .8 4.5C7.5 14 8 16.5 8 19c0 1.7 1.3 3 3 3 .8 0 1.5-.6 1.5-1.4C12.5 19 13 17 13 17s.5 2-.5 3.6c0 .8.7 1.4 1.5 1.4 1.7 0 3-1.3 3-3 0-2.5.5-5 1.2-7.5C18.7 10 19 8.5 19 7c0-3-3-5-7-5z" />
          </svg>
        </div>
        <span className="font-semibold text-foreground">OdontoTrade</span>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Boas-vindas de volta</h1>
        <p className="text-sm text-muted-foreground">
          Entre com seu e-mail e senha para acessar sua conta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full shadow-sm mt-1" disabled={isPending}>
          {isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Não tem uma conta?{" "}
        <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Cadastre-se grátis
        </Link>
      </p>
    </div>
  )
}
