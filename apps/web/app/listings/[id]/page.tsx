import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Tag, User, CalendarDays } from "lucide-react"
import { listingsApi } from "@/lib/api"
import { ListingImageGallery } from "@/components/listing-image-gallery"
import { EditListingButton } from "@/components/edit-listing-button"
import { ContactButton } from "@/components/contact-button"

type Params = Promise<{ id: string }>

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: "Disponível",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  RESERVED: {
    label: "Reservado",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  SOLD: {
    label: "Vendido",
    className: "bg-muted text-muted-foreground border border-border",
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

  const status = STATUS_LABEL[listing.status] ?? STATUS_LABEL["ACTIVE"]!

  const isSold = listing.status === "SOLD"

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Voltar para anúncios
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Galeria */}
        <ListingImageGallery imageUrls={listing.imageUrls} title={listing.title} />

        {/* Informações */}
        <div className="flex flex-col gap-5">
          {/* Título + status + editar */}
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-2xl font-bold leading-snug text-foreground">{listing.title}</h1>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                  {status.label}
                </span>
                <EditListingButton listingId={listing.id} sellerId={listing.sellerId} />
              </div>
            </div>

            {/* Preço em destaque teal */}
            <p className="text-4xl font-bold text-primary">
              {priceFormatter.format(Number(listing.price))}
            </p>
          </div>

          {/* Categoria */}
          {listing.categoryName && (
            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Tag className="size-3" />
              {listing.categoryName}
            </div>
          )}

          {/* Separador */}
          <div className="h-px bg-border/60" />

          {/* Descrição */}
          {listing.description && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-foreground">Descrição</h2>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                {listing.description}
              </p>
            </div>
          )}

          {/* Vendedor */}
          <Link
            href={`/users/${listing.sellerId}`}
            className="rounded-xl border border-border/60 bg-white p-4 flex items-center gap-3 hover:border-primary/30 hover:bg-primary/5 transition-colors"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="size-4.5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Anunciado por</span>
              <span className="text-sm font-semibold text-foreground">{listing.sellerName}</span>
            </div>
          </Link>

          {/* CTA */}
          <ContactButton
            sellerId={listing.sellerId}
            sellerName={listing.sellerName}
            listingId={listing.id}
            listingTitle={listing.title}
            disabled={isSold}
          />

          {/* Data */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            <span>
              Publicado em {dateFormatter.format(new Date(listing.createdAt))}
              {listing.updatedAt !== listing.createdAt && (
                <> &middot; Atualizado em {dateFormatter.format(new Date(listing.updatedAt))}</>
              )}
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
