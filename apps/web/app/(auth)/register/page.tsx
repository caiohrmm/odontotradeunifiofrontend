"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

export default function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres")
      return
    }

    setIsPending(true)
    try {
      await register(name, email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta")
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Crie sua conta</h1>
        <p className="text-sm text-muted-foreground">
          Junte-se ao maior marketplace de odontologia estudantil do Brasil.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome completo"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

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
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            required
            minLength={6}
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
          {isPending ? "Criando conta..." : "Criar conta grátis"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
