export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border/50 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary/10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-primary">
              <path d="M12 2C9 2 6 4 6 7c0 1.5.3 3 .8 4.5C7.5 14 8 16.5 8 19c0 1.7 1.3 3 3 3 .8 0 1.5-.6 1.5-1.4C12.5 19 13 17 13 17s.5 2-.5 3.6c0 .8.7 1.4 1.5 1.4 1.7 0 3-1.3 3-3 0-2.5.5-5 1.2-7.5C18.7 10 19 8.5 19 7c0-3-3-5-7-5z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-foreground">OdontoTrade</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {year} OdontoTrade. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
