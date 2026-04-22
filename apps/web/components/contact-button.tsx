"use client"

import { useState } from "react"
import { MessageCircle, LogIn, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { useAuth } from "@/contexts/auth-context"
import { chatApi } from "@/lib/api"
import { toast } from "sonner"

interface ContactButtonProps {
  sellerId: string
  sellerName: string
  listingId: string
  listingTitle: string
  disabled?: boolean
}

export function ContactButton({
  sellerId,
  sellerName,
  listingId,
  listingTitle,
  disabled,
}: ContactButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (disabled) {
    return (
      <Button className="w-full" size="lg" disabled>
        Anúncio encerrado
      </Button>
    )
  }

  // Vendedor vendo o próprio anúncio
  if (user?.userId === sellerId) {
    return (
      <Button variant="outline" className="w-full" size="lg" disabled>
        Este é seu anúncio
      </Button>
    )
  }

  // Não logado → redireciona para login
  if (!user) {
    return (
      <Button asChild className="w-full gap-2 shadow-sm" size="lg">
        <Link href={`/login?from=/listings/${listingId}`}>
          <LogIn className="size-4" />
          Entre para contatar o vendedor
        </Link>
      </Button>
    )
  }

  async function handleContact() {
    setLoading(true)
    try {
      const room = await chatApi.createOrGetRoom(listingId, user?.userId || "")
      router.push(`/profile/chats?roomId=${room.id}`)
    } catch (err) {
      console.error(err)
      toast.error("Erro ao iniciar conversa", {
        description: "Não foi possível abrir o chat no momento."
      })
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleContact}
      disabled={loading}
      className="w-full gap-2 shadow-sm"
      size="lg"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}
      {loading ? "Abrindo chat..." : "Entrar em contato"}
    </Button>
  )
}

