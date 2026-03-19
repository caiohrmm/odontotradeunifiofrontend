"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authApi, type AuthResponse } from "@/lib/api"

interface AuthContextValue {
  user: AuthResponse | null
  isLoading: boolean
  login(email: string, password: string, redirectTo?: string): Promise<void>
  register(name: string, email: string, password: string): Promise<void>
  logout(): void
  updateUser(updates: Partial<Pick<AuthResponse, "name" | "email">>): void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      const stored = localStorage.getItem("auth_user")
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch {
      localStorage.removeItem("auth_user")
      localStorage.removeItem("auth_token")
    } finally {
      setIsLoading(false)
    }
  }, [])

  function persistSession(data: AuthResponse) {
    const maxAge = 60 * 60 * 24 // 24 h
    localStorage.setItem("auth_token", data.token)
    localStorage.setItem("auth_user", JSON.stringify(data))
    document.cookie = `auth_token=${data.token}; path=/; max-age=${maxAge}; SameSite=Lax`
  }

  function clearSession() {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax"
  }

  async function login(email: string, password: string, redirectTo = "/") {
    const data = await authApi.login(email, password)
    persistSession(data)
    setUser(data)
    router.push(redirectTo)
  }

  async function register(name: string, email: string, password: string) {
    const data = await authApi.register(name, email, password)
    persistSession(data)
    setUser(data)
    router.push("/")
  }

  function logout() {
    clearSession()
    setUser(null)
    router.push("/login")
  }

  function updateUser(updates: Partial<Pick<AuthResponse, "name" | "email">>) {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...updates }
      localStorage.setItem("auth_user", JSON.stringify(next))
      return next
    })
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
