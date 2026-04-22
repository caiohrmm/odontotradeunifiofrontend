"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ImageOff, Pencil, Settings, Trash2, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { listingsApi, type ListingSummaryResponse } from "@/lib/api"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const STATUS_META: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: "Disponivel",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  RESERVED: {
    label: "Reservado",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  SOLD: {
    label: "Vendido",
    className: "bg-muted text-muted-foreground",
  },
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  USER: "Estudante",
}

const FILTER_TABS = [
  { value: "ALL", label: "Todos" },
  { value: "ACTIVE", label: "Disponiveis" },
  { value: "RESERVED", label: "Reservados" },
  { value: "SOLD", label: "Vendidos" },
]

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ")
  const initials = (
    (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")
  ).toUpperCase()

  return (
    <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-semibold">
      {initials}
    </div>
  )
}

function ProfileListingCard({
  listing,
  onDelete,
}: {
  listing: ListingSummaryResponse
  onDelete: (id: string) => Promise<void>
}) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const status = STATUS_META[listing.status] ?? STATUS_META.ACTIVE!
  const imageUrl = listing.imageUrls?.[0]

  async function handleConfirm() {
    setDeleting(true)
    try {
      await onDelete(listing.id)
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div className="flex gap-3 rounded-xl border p-3">
      {/* Thumbnail */}
      <Link
        href={`/listings/${listing.id}`}
        className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-7 opacity-40" />
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/listings/${listing.id}`}
            className="line-clamp-2 text-sm font-medium leading-snug hover:underline"
          >
            {listing.title}
          </Link>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
              status.className
            )}
          >
            {status.label}
          </span>
        </div>

        <p className="text-sm font-semibold">
          {priceFormatter.format(Number(listing.price))}
        </p>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-1">
          {!confirming ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={`/listings/${listing.id}/edit`}>
                  <Pencil className="size-3.5" />
                  Editar
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirming(true)}
              >
                <Trash2 className="size-3.5" />
                Excluir
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                Tem certeza?
              </span>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleting}
                onClick={handleConfirm}
              >
                {deleting ? "Excluindo..." : "Confirmar"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={deleting}
                onClick={() => setConfirming(false)}
              >
                Cancelar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [listings, setListings] = useState<ListingSummaryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")

  useEffect(() => {
    if (!user) return
    listingsApi
      .listByUser(user.userId)
      .then((res) => setListings(res.content))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  async function handleDelete(id: string) {
    try {
      await listingsApi.delete(id)
      setListings((prev) => prev.filter((l) => l.id !== id))
      toast.success("Anuncio excluido com sucesso.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir anuncio.")
      throw err
    }
  }

  if (!user) return null

  const filtered =
    filter === "ALL" ? listings : listings.filter((l) => l.status === filter)

  const counts = {
    ALL: listings.length,
    ACTIVE: listings.filter((l) => l.status === "ACTIVE").length,
    RESERVED: listings.filter((l) => l.status === "RESERVED").length,
    SOLD: listings.filter((l) => l.status === "SOLD").length,
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 flex flex-col gap-8">
      {/* Perfil */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Initials name={user.name} />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <span className="w-fit rounded-full border px-2 py-0.5 text-xs font-medium">
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <Button asChild variant="outline" size="sm">
            <Link href="/profile/edit">
              <Settings className="size-4" />
              Editar perfil
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/profile/chats">
              <MessageCircle className="size-4" />
              Minhas Conversas
            </Link>
          </Button>
        </div>
      </div>

      {/* Anuncios */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Meus anuncios</h2>
          <Button asChild size="sm">
            <Link href="/listings/new">Novo anuncio</Link>
          </Button>
        </div>

        {/* Filtro */}
        <div className="flex gap-1 overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-sm transition-colors",
                filter === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {tab.label}
              <span className="ml-1 text-xs opacity-70">
                ({counts[tab.value as keyof typeof counts]})
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Carregando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {filter === "ALL"
              ? "Voce ainda nao publicou nenhum anuncio."
              : "Nenhum anuncio com este status."}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((listing) => (
              <ProfileListingCard
                key={listing.id}
                listing={listing}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
