"use client"

import Link from "next/link"
import { Pencil } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@workspace/ui/components/button"

export function EditListingButton({
  listingId,
  sellerId,
}: {
  listingId: string
  sellerId: string
}) {
  const { user } = useAuth()

  if (!user || user.userId !== sellerId) return null

  return (
    <Button asChild variant="outline" size="sm">
      <Link href={`/listings/${listingId}/edit`}>
        <Pencil className="size-4" />
        Editar
      </Link>
    </Button>
  )
}
