"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"
import {
  listingsApi,
  uploadApi,
  type CategoryResponse,
  type ListingResponse,
} from "@/lib/api"
import { useCurrencyInput } from "@/hooks/use-currency-input"

type ExistingImage = { kind: "existing"; url: string }
type NewImage = {
  kind: "new"
  file: File
  preview: string
  url: string | null
  uploading: boolean
  error: boolean
}
type ImageItem = ExistingImage | NewImage

function initImages(urls: string[]): ImageItem[] {
  return urls.map((url) => ({ kind: "existing", url }))
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ACTIVE", label: "Disponivel" },
  { value: "RESERVED", label: "Reservado" },
  { value: "SOLD", label: "Vendido" },
]

export function EditListingForm({
  listing,
  categories,
}: {
  listing: ListingResponse
  categories: CategoryResponse[]
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(listing.title)
  const [description, setDescription] = useState(listing.description ?? "")
  const price = useCurrencyInput(listing.price != null ? Number(listing.price) : undefined)
  const [categoryId, setCategoryId] = useState(listing.categoryId ?? "")
  const [status, setStatus] = useState<string>(listing.status)
  const [images, setImages] = useState<ImageItem[]>(() =>
    initImages(listing.imageUrls)
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const toAdd = files.slice(0, 20 - images.length)
    if (fileInputRef.current) fileInputRef.current.value = ""

    const newItems: NewImage[] = toAdd.map((file) => ({
      kind: "new",
      file,
      preview: URL.createObjectURL(file),
      url: null,
      uploading: true,
      error: false,
    }))

    setImages((prev) => [...prev, ...newItems])

    for (const file of toAdd) {
      try {
        const { url } = await uploadApi.upload(file)
        setImages((prev) =>
          prev.map((item) =>
            item.kind === "new" && item.file === file
              ? { ...item, url, uploading: false }
              : item
          )
        )
      } catch {
        setImages((prev) =>
          prev.map((item) =>
            item.kind === "new" && item.file === file
              ? { ...item, error: true, uploading: false }
              : item
          )
        )
        toast.error("Falha ao enviar uma imagem. Tente removê-la e adicionar novamente.")
      }
    }
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const item = prev[index]!
      if (item.kind === "new") URL.revokeObjectURL(item.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (images.some((img) => img.kind === "new" && img.uploading)) {
      setError("Aguarde o upload das imagens terminar.")
      return
    }
    if (images.some((img) => img.kind === "new" && img.error)) {
      setError("Remova as imagens com erro antes de continuar.")
      return
    }

    const imageUrls = images.map((img) =>
      img.kind === "existing" ? img.url : img.url!
    )

    setIsPending(true)
    try {
      await listingsApi.update(listing.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        price: price.numericValue,
        categoryId: categoryId || undefined,
        status: status as ListingResponse["status"],
        imageUrls,
      })
      toast.success("Alteracoes salvas com sucesso!")
      router.push(`/listings/${listing.id}`)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar anuncio."
      setError(message)
      toast.error(message)
      setIsPending(false)
    }
  }

  const canAddMore = images.length < 20

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Fotos */}
      <div className="flex flex-col gap-2">
        <Label>
          Fotos{" "}
          <span className="font-normal text-muted-foreground">(max. 20)</span>
        </Label>

        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => {
            const preview = img.kind === "existing" ? img.url : img.preview
            const uploading = img.kind === "new" && img.uploading
            const hasError = img.kind === "new" && img.error

            return (
              <div
                key={i}
                className="relative size-24 shrink-0 overflow-hidden rounded-lg border bg-muted"
              >
                <img src={preview} alt="" className="h-full w-full object-cover" />

                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Loader2 className="size-5 animate-spin" />
                  </div>
                )}

                {hasError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-destructive/20">
                    <span className="text-xs font-medium text-destructive">Erro</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 hover:bg-background"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )
          })}

          {canAddMore && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex size-24 items-center justify-center rounded-lg border-2 border-dashed",
                "text-muted-foreground transition-colors",
                "hover:border-muted-foreground/50 hover:bg-muted"
              )}
            >
              <Plus className="size-6" />
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Titulo */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">
          Titulo <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          required
          maxLength={255}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Descricao */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descricao</Label>
        <textarea
          id="description"
          maxLength={10000}
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Preco */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Preco (R$)</Label>
          <Input
            id="price"
            type="text"
            inputMode="numeric"
            placeholder="0,00"
            value={price.formattedValue}
            onChange={price.handleChange}
          />
        </div>

        {/* Categoria */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Categoria</Label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Sem categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Status do anuncio</Label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar alteracoes"
          )}
        </Button>
      </div>
    </form>
  )
}
