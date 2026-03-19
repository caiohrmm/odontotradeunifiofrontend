import { listingsApi, categoriesApi } from "@/lib/api"
import { ListingCard } from "@/components/listing-card"
import { ListingFilters } from "@/components/listing-filters"
import { ListingsPagination } from "@/components/listings-pagination"

type SearchParams = Promise<{
  search?: string
  categoryId?: string
  page?: string
}>

export default async function HomePage({
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
    <main className="mx-auto max-w-7xl px-4 py-6 flex flex-col gap-6">
      <ListingFilters categories={categories} />

      {listingsResult.content.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground">
          Nenhum anúncio encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {listingsResult.content.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
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
