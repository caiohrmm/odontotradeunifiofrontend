import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { listingsApi, categoriesApi } from "@/lib/api"
import { EditListingForm } from "@/components/edit-listing-form"

type Params = Promise<{ id: string }>

export default async function EditListingPage({ params }: { params: Params }) {
  const { id } = await params

  let listing
  try {
    listing = await listingsApi.getById(id)
  } catch {
    notFound()
  }

  const categories = await categoriesApi.list()

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <Link
        href={`/listings/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para o anuncio
      </Link>

      <h1 className="mb-6 text-2xl font-semibold">Editar anuncio</h1>

      <EditListingForm listing={listing} categories={categories} />
    </main>
  )
}
