"use client"

import { useState } from "react"
import { ImageOff } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

export function ListingImageGallery({
  imageUrls,
  title,
}: {
  imageUrls: string[]
  title: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (imageUrls.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <ImageOff className="size-16 opacity-40" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-muted">
        <img
          src={imageUrls[activeIndex]}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>

      {imageUrls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imageUrls.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                activeIndex === i
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/30"
              )}
            >
              <img
                src={url}
                alt={`${title} ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
