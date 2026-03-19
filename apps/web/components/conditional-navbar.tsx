"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"

const AUTH_PATHS = ["/login", "/register"]

export function ConditionalNavbar() {
  const pathname = usePathname()
  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) return null
  return <Navbar />
}
