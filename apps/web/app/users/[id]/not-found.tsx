import Link from "next/link"
import { Button } from "@workspace/ui/components/button"

export default function UserNotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Vendedor nao encontrado</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Este perfil nao existe ou o vendedor ainda nao publicou nenhum anuncio.
      </p>
      <Button asChild>
        <Link href="/">Ver todos os anuncios</Link>
      </Button>
    </main>
  )
}
