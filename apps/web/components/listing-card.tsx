import Link from "next/link"
import { ImageOff } from "lucide-react"
import type { ListingSummaryResponse } from "@/lib/api"

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export function ListingCard({ listing }: { listing: ListingSummaryResponse }) {
  const imageUrl = listing.imageUrls?.[0]

  return (
    <Link href={`/listings/${listing.id}`} className="group flex flex-col">
      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.5 h-full flex flex-col">
        {/* Imagem */}
        <div className="aspect-square overflow-hidden bg-muted/50">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
              <ImageOff className="size-10" />
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex flex-col gap-1 p-3 flex-1">
          {listing.categoryName && (
            <span className="text-[10px] font-medium uppercase tracking-wide text-primary/70">
              {listing.categoryName}
            </span>
          )}
          <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
            {listing.title}
          </p>
          <p className="mt-auto pt-2 text-base font-bold text-primary">
            {priceFormatter.format(Number(listing.price))}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {listing.sellerName}
          </p>
        </div>
      </div>
    </Link>
  )
}
