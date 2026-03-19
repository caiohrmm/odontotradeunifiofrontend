import Link from "next/link"
import { Button } from "@workspace/ui/components/button"

export default function ListingNotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-2xl font-semibold">Anuncio nao encontrado</h1>
      <p className="text-muted-foreground text-sm max-w-sm">
        Este anuncio pode ter sido removido ou o link esta incorreto.
      </p>
      <Button asChild>
        <Link href="/">Ver todos os anuncios</Link>
      </Button>
    </main>
  )
}
