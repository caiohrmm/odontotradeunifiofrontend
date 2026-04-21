import { ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"
import { listingsApi, categoriesApi } from "@/lib/api"
import { ListingCard } from "@/components/listing-card"
import { ListingFilters } from "@/components/listing-filters"
import { ListingsPagination } from "@/components/listings-pagination"
import { Button } from "@workspace/ui/components/button"

type SearchParams = Promise<{
  search?: string
  categoryId?: string
  page?: string
}>

export default async function FeedPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { search, categoryId, page } = await searchParams

  const [listingsResult, categories] = await Promise.all([
    listingsApi.list({
      status: "ACTIVE",
      search,
      categoryId,
      page: page ? Number(page) : 0,
      size: 20,
    }),
    categoriesApi.list(),
  ])

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 flex flex-col gap-6">
      <ListingFilters categories={categories} />

      {listingsResult.content.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-3 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="size-7 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">Nenhum anúncio encontrado</p>
          <p className="text-sm text-muted-foreground">Tente outros filtros ou seja o primeiro a anunciar!</p>
          <Button asChild size="sm" className="mt-2 gap-1.5">
            <Link href="/listings/new">
              <ArrowRight className="size-3.5" />
              Criar anúncio
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground -mb-2">
            {listingsResult.totalElements}{" "}
            {listingsResult.totalElements === 1 ? "anúncio encontrado" : "anúncios encontrados"}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {listingsResult.content.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      )}

      {listingsResult.totalPages > 1 && (
        <ListingsPagination
          currentPage={listingsResult.number}
          totalPages={listingsResult.totalPages}
        />
      )}
    </main>
  )
}
