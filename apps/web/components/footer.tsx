export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-muted-foreground">
        © {year} OdontoTrade UNIFIO. Todos os direitos reservados.
      </div>
    </footer>
  )
}

