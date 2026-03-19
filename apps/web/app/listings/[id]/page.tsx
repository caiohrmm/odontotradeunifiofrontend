import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Tag, User } from "lucide-react"
import { listingsApi } from "@/lib/api"
import { ListingImageGallery } from "@/components/listing-image-gallery"
import { EditListingButton } from "@/components/edit-listing-button"
import { Button } from "@workspace/ui/components/button"

type Params = Promise<{ id: string }>

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
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

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

export default async function ListingDetailPage({ params }: { params: Params }) {
  const { id } = await params

  let listing
  try {
    listing = await listingsApi.getById(id)
  } catch {
    notFound()
  }

  const status = STATUS_LABEL[listing.status] ?? STATUS_LABEL.ACTIVE
  const isSold = listing.status === "SOLD"

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para anúncios
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Galeria */}
        <ListingImageGallery imageUrls={listing.imageUrls} title={listing.title} />

        {/* Informações */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-2xl font-semibold leading-snug">{listing.title}</h1>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                >
                  {status.label}
                </span>
                <EditListingButton
                  listingId={listing.id}
                  sellerId={listing.sellerId}
                />
              </div>
            </div>

            <p className="text-3xl font-bold">
              {priceFormatter.format(Number(listing.price))}
            </p>
          </div>

          {listing.categoryName && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Tag className="size-3.5" />
              {listing.categoryName}
            </div>
          )}

          {listing.description && (
            <div className="flex flex-col gap-1.5">
              <h2 className="text-sm font-medium">Descricao</h2>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                {listing.description}
              </p>
            </div>
          )}

          <Link
            href={`/users/${listing.sellerId}`}
            className="rounded-lg border p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
              <User className="size-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Vendido por</span>
              <span className="text-sm font-medium">{listing.sellerName}</span>
            </div>
          </Link>

          <Button className="w-full" size="lg" disabled={isSold}>
            {isSold ? "Anuncio encerrado" : "Entrar em contato"}
          </Button>

          <p className="text-xs text-muted-foreground">
            Publicado em {dateFormatter.format(new Date(listing.createdAt))}
            {listing.updatedAt !== listing.createdAt && (
              <> &middot; Atualizado em {dateFormatter.format(new Date(listing.updatedAt))}</>
            )}
          </p>
        </div>
      </div>
    </main>
  )
}
