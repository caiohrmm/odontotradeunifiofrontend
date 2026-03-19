import Link from "next/link"
import { ImageOff } from "lucide-react"
import { Card, CardContent } from "@workspace/ui/components/card"
import type { ListingSummaryResponse } from "@/lib/api"

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export function ListingCard({ listing }: { listing: ListingSummaryResponse }) {
  const imageUrl = listing.imageUrls?.[0]

  return (
    <Link href={`/listings/${listing.id}`} className="group">
      <Card className="overflow-hidden gap-0 py-0 transition-shadow group-hover:shadow-md h-full">
        <div className="aspect-square overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageOff className="size-10 opacity-40" />
            </div>
          )}
        </div>

        <CardContent className="flex flex-col gap-1 py-3">
          {listing.categoryName && (
            <span className="text-xs text-muted-foreground">
              {listing.categoryName}
            </span>
          )}
          <p className="line-clamp-2 text-sm font-medium leading-snug">
            {listing.title}
          </p>
          <p className="text-base font-semibold">
            {priceFormatter.format(Number(listing.price))}
          </p>
          <p className="text-xs text-muted-foreground">
            por {listing.sellerName}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
