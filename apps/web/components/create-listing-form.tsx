"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, X, UploadCloud, ImageOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"
import { listingsApi, uploadApi, type CategoryResponse } from "@/lib/api"
import { useCurrencyInput } from "@/hooks/use-currency-input"

// Categorias odontológicas estáticas — usadas quando o backend não retorna nenhuma
const DENTAL_CATEGORIES = [
  { id: "__cirurgia__",       name: "Cirurgia Oral e Maxilofacial" },
  { id: "__endodontia__",     name: "Endodontia (Canal Radicular)" },
  { id: "__dentistica__",     name: "Dentística Restauradora" },
  { id: "__periodontia__",    name: "Periodontia" },
  { id: "__pediatria__",      name: "Odontopediatria" },
  { id: "__estetica__",       name: "Estética Dental" },
  { id: "__protese__",        name: "Prótese Dentária" },
  { id: "__ortodontia__",     name: "Ortodontia" },
  { id: "__radiologia__",     name: "Radiologia Odontológica" },
  { id: "__anestesiologia__", name: "Anestesiologia" },
  { id: "__implante__",       name: "Implantodontia" },
  { id: "__odontologia__",    name: "Saúde Coletiva / Preventiva" },
  { id: "__materiais__",      name: "Materiais Dentários (Geral)" },
  { id: "__equipamentos__",   name: "Equipamentos Odontológicos" },
]

const CONDITIONS = [
  { value: "NOVO",      label: "Novo (lacrado)" },
  { value: "SEMINOVO",  label: "Seminovo (usado 1 semestre)" },
  { value: "BOM",       label: "Bom estado (usado)" },
  { value: "REGULAR",   label: "Regular (marcas de uso)" },
]

interface ImageItem {
  file: File
  preview: string
  url: string | null
  uploading: boolean
  error: boolean
}

export function CreateListingForm({ categories }: { categories: CategoryResponse[] }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const [title, setTitle]           = useState("")
  const [description, setDescription] = useState("")
  const [quantity, setQuantity]     = useState("1")
  const [condition, setCondition]   = useState("")
  const price                        = useCurrencyInput()
  const [categoryId, setCategoryId] = useState("")
  const [images, setImages]         = useState<ImageItem[]>([])
  const [error, setError]           = useState<string | null>(null)
  const [isPending, setIsPending]   = useState(false)

  // Usa categorias do backend; se vazio, usa lista dental hardcoded
  const categoryOptions = categories.length > 0 ? categories : DENTAL_CATEGORIES

  async function processFiles(files: File[]) {
    const toAdd = files.filter((f) => f.type.startsWith("image/")).slice(0, 20 - images.length)
    if (!toAdd.length) return
    if (fileInputRef.current) fileInputRef.current.value = ""

    const newItems: ImageItem[] = toAdd.map((file) => ({
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
          prev.map((item) => (item.file === file ? { ...item, url, uploading: false } : item))
        )
      } catch {
        setImages((prev) =>
          prev.map((item) =>
            item.file === file ? { ...item, error: true, uploading: false } : item
          )
        )
        toast.error("Falha ao enviar imagem. Tente remover e adicionar novamente.")
      }
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    processFiles(Array.from(e.target.files ?? []))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    processFiles(Array.from(e.dataTransfer.files))
  }

  function removeImage(index: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index]!.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError(null)

    if (images.some((img) => img.uploading)) {
      setError("Aguarde o upload das imagens terminar.")
      return
    }
    if (images.some((img) => img.error)) {
      setError("Remova as imagens com erro antes de continuar.")
      return
    }

    // Monta descrição incluindo quantidade e condição
    const qty = parseInt(quantity) || 1
    const conditionLabel = CONDITIONS.find((c) => c.value === condition)?.label ?? ""
    let fullDescription = description.trim()
    const meta: string[] = []
    if (qty > 1) meta.push(`Quantidade: ${qty} unidades`)
    if (conditionLabel) meta.push(`Condição: ${conditionLabel}`)
    if (meta.length > 0) {
      fullDescription = meta.join(" · ") + (fullDescription ? "\n\n" + fullDescription : "")
    }

    // Ignora IDs internos (hardcoded) ao enviar para o backend
    const finalCategoryId = categoryId.startsWith("__") ? undefined : (categoryId || undefined)

    setIsPending(true)
    try {
      const listing = await listingsApi.create({
        title: title.trim(),
        description: fullDescription || undefined,
        price: price.numericValue,
        categoryId: finalCategoryId,
        imageUrls: images.map((img) => img.url!),
      })
      toast.success("Anúncio publicado com sucesso!")
      router.push(`/listings/${listing.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar anúncio."
      setError(message)
      toast.error(message)
      setIsPending(false)
    }
  }

  const canAddMore = images.length < 20

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* ── Upload de Fotos ─────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <Label>
          Fotos{" "}
          <span className="text-xs font-normal text-muted-foreground">(máx. 20)</span>
        </Label>

        {/* Drop zone */}
        {canAddMore && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border/70 bg-muted/30 hover:border-primary/40 hover:bg-primary/3"
            )}
          >
            <div className={cn(
              "flex size-12 items-center justify-center rounded-full transition-colors",
              isDragging ? "bg-primary/15" : "bg-muted"
            )}>
              <UploadCloud className={cn("size-6 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {isDragging ? "Solte as imagens aqui" : "Arraste fotos ou clique para selecionar"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WEBP até 10MB cada</p>
            </div>
          </div>
        )}

        {/* Pré-visualização */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted"
              >
                {img.preview ? (
                  <img src={img.preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageOff className="size-5 text-muted-foreground" />
                  </div>
                )}

                {img.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Loader2 className="size-5 animate-spin text-primary" />
                  </div>
                )}
                {img.error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-destructive/20">
                    <span className="text-[10px] font-bold text-destructive">ERRO</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-0.5 top-0.5 rounded-full bg-background/80 p-0.5 hover:bg-background shadow-sm"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* ── Título ─────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">
          Título <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          required
          maxLength={255}
          placeholder="Ex: Kit Curetas Gracey — Completo 7 peças"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* ── Categoria + Condição ────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Disciplina / Categoria</Label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Selecione a disciplina</option>
            {categoryOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="condition">Condição do produto</Label>
          <select
            id="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Selecione a condição</option>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Preço + Quantidade ──────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input
            id="price"
            type="text"
            inputMode="numeric"
            placeholder="0,00"
            value={price.formattedValue}
            onChange={price.handleChange}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quantity">Quantidade disponível</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            max="999"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="1"
          />
          <p className="text-xs text-muted-foreground">Nº de unidades / peças do kit</p>
        </div>
      </div>

      {/* ── Descrição ──────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descrição detalhada</Label>
        <textarea
          id="description"
          maxLength={10000}
          rows={5}
          placeholder="Descreva o produto: estado de conservação, marca, o que está incluído no kit, semestre em que foi usado, etc."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending} className="flex-1 shadow-sm">
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Publicando...
            </>
          ) : (
            "Publicar anúncio"
          )}
        </Button>
      </div>
    </form>
  )
}
