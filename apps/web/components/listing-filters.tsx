"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import type { CategoryResponse } from "@/lib/api"

// Disciplinas odontológicas — usadas quando backend não retorna categorias
const DENTAL_DISCIPLINES = [
  { id: "__cirurgia__",       name: "Cirurgia" },
  { id: "__endodontia__",     name: "Endodontia" },
  { id: "__dentistica__",     name: "Dentística" },
  { id: "__periodontia__",    name: "Periodontia" },
  { id: "__pediatria__",      name: "Odontopediatria" },
  { id: "__estetica__",       name: "Estética" },
  { id: "__protese__",        name: "Prótese" },
  { id: "__ortodontia__",     name: "Ortodontia" },
  { id: "__radiologia__",     name: "Radiologia" },
  { id: "__anestesiologia__", name: "Anestesiologia" },
  { id: "__materiais__",      name: "Materiais" },
  { id: "__equipamentos__",   name: "Equipamentos" },
]

const PRICE_RANGES = [
  { label: "Até R$ 50",        min: "",   max: "50"   },
  { label: "R$ 50–150",        min: "50", max: "150"  },
  { label: "R$ 150–300",       min: "150",max: "300"  },
  { label: "Acima de R$ 300",  min: "300",max: ""     },
]

function FiltersInner({ categories }: { categories: CategoryResponse[] }) {
  const router   = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [showMore, setShowMore] = useState(false)

  const currentCategory = searchParams.get("categoryId") ?? ""
  const currentMin      = searchParams.get("minPrice") ?? ""
  const currentMax      = searchParams.get("maxPrice") ?? ""

  const displayCategories = categories.length > 0 ? categories : DENTAL_DISCIPLINES
  const visibleCategories = showMore ? displayCategories : displayCategories.slice(0, 8)

  function buildUrl(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key)
      else params.set(key, value)
    }
    params.delete("page")
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  function handleCategory(id: string) {
    // IDs hardcoded (__xxx__) são só visuais — filtram pelo nome via search
    if (id.startsWith("__") && id.endsWith("__")) {
      const disc = DENTAL_DISCIPLINES.find((d) => d.id === id)
      if (disc) {
        const alreadyActive = searchParams.get("search") === disc.name
        router.push(buildUrl({ search: alreadyActive ? null : disc.name, categoryId: null }))
      }
      return
    }
    router.push(buildUrl({ categoryId: id === currentCategory ? null : id }))
  }

  function handlePriceRange(min: string, max: string) {
    const alreadyActive = currentMin === min && currentMax === max
    router.push(buildUrl({
      minPrice: alreadyActive ? null : min,
      maxPrice: alreadyActive ? null : max,
    }))
  }

  function clearFilters() {
    router.push(pathname)
  }

  const hasFilters = searchParams.get("categoryId") || searchParams.get("search") ||
                     currentMin || currentMax

  const activeSearch   = searchParams.get("search") ?? ""
  const activeCat      = displayCategories.find((c) => c.id === currentCategory)
  const activePriceRange = PRICE_RANGES.find((r) => r.min === currentMin && r.max === currentMax)

  return (
    <div className="flex flex-col gap-4">

      {/* Chips de filtros ativos */}
      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="size-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground">Filtrando:</span>
          {activeSearch && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
              "{activeSearch}"
            </span>
          )}
          {activeCat && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
              {activeCat.name}
            </span>
          )}
          {activePriceRange && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
              {activePriceRange.label}
            </span>
          )}
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <X className="size-3" /> Limpar tudo
          </button>
        </div>
      )}

      {/* Disciplinas / categorias */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Disciplina
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => router.push(buildUrl({ categoryId: null, search: null }))}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              !currentCategory && !activeSearch
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border/70 bg-white text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5"
            )}
          >
            Todas
          </button>

          {visibleCategories.map((cat) => {
            const isHardcoded = cat.id.startsWith("__")
            const isActive = isHardcoded
              ? activeSearch === cat.name
              : currentCategory === cat.id

            return (
              <button
                key={cat.id}
                onClick={() => handleCategory(cat.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border/70 bg-white text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5"
                )}
              >
                {cat.name}
              </button>
            )
          })}

          {displayCategories.length > 8 && (
            <button
              onClick={() => setShowMore((v) => !v)}
              className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-border/70 px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showMore ? (
                <><ChevronUp className="size-3" /> Menos</>
              ) : (
                <><ChevronDown className="size-3" /> +{displayCategories.length - 8} mais</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Faixa de preço */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Faixa de Preço
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_RANGES.map((range) => {
            const isActive = currentMin === range.min && currentMax === range.max
            return (
              <button
                key={range.label}
                onClick={() => handlePriceRange(range.min, range.max)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border/70 bg-white text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5"
                )}
              >
                {range.label}
              </button>
            )
          })}
        </div>
      </div>
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
