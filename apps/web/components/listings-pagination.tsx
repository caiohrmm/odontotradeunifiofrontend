"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

interface Props {
  currentPage: number
  totalPages: number
}

function PaginationInner({ currentPage, totalPages }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 0}
        onClick={() => goToPage(currentPage - 1)}
      >
        <ChevronLeft />
      </Button>

      <span className="text-sm text-muted-foreground">
        Página {currentPage + 1} de {totalPages}
      </span>

      <Button
        variant="outline"
        size="icon"
        disabled={currentPage >= totalPages - 1}
        onClick={() => goToPage(currentPage + 1)}
      >
        <ChevronRight />
      </Button>
    </div>
  )
}

export function ListingsPagination({ currentPage, totalPages }: Props) {
  return (
    <Suspense>
      <PaginationInner currentPage={currentPage} totalPages={totalPages} />
    </Suspense>
  )
}
