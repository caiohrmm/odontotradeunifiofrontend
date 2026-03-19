import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { listingsApi } from "@/lib/api"
import { ListingCard } from "@/components/listing-card"
import { ListingsPagination } from "@/components/listings-pagination"

type Params = Promise<{ id: string }>
type SearchParams = Promise<{ page?: string }>

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ")
  const initials = (
    (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")
  ).toUpperCase()
  return (
    <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-semibold select-none">
      {initials}
    </div>
  )
}

export default async function PublicProfilePage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { id } = await params
  const { page } = await searchParams

  const result = await listingsApi.list({
    sellerId: id,
    status: "ACTIVE",
    page: page ? Number(page) : 0,
    size: 20,
  })

  // sellerId não corresponde a nenhum usuário conhecido — não temos como verificar
  // sem um endpoint público de usuário, então exibimos o que temos
  const sellerName = result.content[0]?.sellerName ?? null

  if (!sellerName && result.totalElements === 0) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 flex flex-col gap-8">
      <div>
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para anuncios
        </Link>
      </div>

      {/* Header do vendedor */}
      <div className="flex items-center gap-4">
        {sellerName && <Initials name={sellerName} />}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">
            {sellerName ?? "Vendedor"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {result.totalElements}{" "}
            {result.totalElements === 1 ? "anuncio ativo" : "anuncios ativos"}
          </p>
        </div>
      </div>

      {/* Listagens */}
      {result.content.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          Este vendedor nao possui anuncios ativos no momento.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {result.content.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {result.totalPages > 1 && (
            <ListingsPagination
              currentPage={result.number}
              totalPages={result.totalPages}
            />
          )}
        </>
      )}
    </main>
  )
}
