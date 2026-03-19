"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, X } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import type { CategoryResponse } from "@/lib/api"

function FiltersInner({ categories }: { categories: CategoryResponse[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get("categoryId") ?? ""
  const currentSearch = searchParams.get("search") ?? ""
  const [searchValue, setSearchValue] = useState(currentSearch)

  function buildUrl(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    params.delete("page")
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(buildUrl({ search: searchValue }))
  }

  function handleCategory(id: string) {
    router.push(buildUrl({ categoryId: id === currentCategory ? null : id }))
  }

  function clearFilters() {
    setSearchValue("")
    router.push(pathname)
  }

  const hasFilters = currentSearch || currentCategory

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar anúncios..."
            className="pl-8"
          />
        </div>
        <Button type="submit">Buscar</Button>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            title="Limpar filtros"
          >
            <X />
          </Button>
        )}
      </form>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategory(cat.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                currentCategory === cat.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-muted"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ListingFilters({ categories }: { categories: CategoryResponse[] }) {
  return (
    <Suspense>
      <FiltersInner categories={categories} />
    </Suspense>
  )
}
