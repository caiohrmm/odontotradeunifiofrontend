export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh grid lg:grid-cols-2">
      {/* Painel esquerdo — branding */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary to-primary/70 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-white">
              <path d="M12 2C9 2 6 4 6 7c0 1.5.3 3 .8 4.5C7.5 14 8 16.5 8 19c0 1.7 1.3 3 3 3 .8 0 1.5-.6 1.5-1.4C12.5 19 13 17 13 17s.5 2-.5 3.6c0 .8.7 1.4 1.5 1.4 1.7 0 3-1.3 3-3 0-2.5.5-5 1.2-7.5C18.7 10 19 8.5 19 7c0-3-3-5-7-5z" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">OdontoTrade</span>
        </div>

        <div className="flex flex-col gap-4">
          <blockquote className="text-2xl font-light leading-relaxed text-white/90">
            "O melhor lugar para dar uma nova vida aos seus instrumentais e encontrar o que você precisa para a faculdade."
          </blockquote>
          <p className="text-sm text-white/60">Marketplace de odontologia estudantil</p>
        </div>

        <div className="flex gap-6 text-white/70 text-sm">
          <span>Instrumentais</span>
          <span>Materiais</span>
          <span>Equipamentos</span>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex items-center justify-center bg-background p-6 sm:p-10">
        {children}
      </div>
    </div>
  )
}
