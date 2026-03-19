import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { categoriesApi } from "@/lib/api"
import { CreateListingForm } from "@/components/create-listing-form"

export default async function NewListingPage() {
  const categories = await categoriesApi.list()

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar
      </Link>

      <h1 className="mb-6 text-2xl font-semibold">Novo anuncio</h1>

      <CreateListingForm categories={categories} />
    </main>
  )
}
