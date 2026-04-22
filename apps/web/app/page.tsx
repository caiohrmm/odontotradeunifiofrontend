"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Sparkles,
  Wrench,
  Syringe,
  FlaskConical,
  Stethoscope,
  Package,
  Volume2,
  VolumeX,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"


function ToothIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2C9 2 6 4 6 7c0 1.5.3 3 .8 4.5C7.5 14 8 16.5 8 19c0 1.7 1.3 3 3 3 .8 0 1.5-.6 1.5-1.4C12.5 19 13 17 13 17s.5 2-.5 3.6c0 .8.7 1.4 1.5 1.4 1.7 0 3-1.3 3-3 0-2.5.5-5 1.2-7.5C18.7 10 19 8.5 19 7c0-3-3-5-7-5z" />
    </svg>
  )
}

const FEATURES = [
  {
    icon: Wrench,
    title: "Instrumentais",
    desc: "Kits cirúrgicos, fórceps, sondas e muito mais com desconto real.",
  },
  {
    icon: FlaskConical,
    title: "Materiais",
    desc: "Resinas, cimentos, alginatos, reveladores e materiais de uso clínico.",
  },
  {
    icon: Stethoscope,
    title: "Equipamentos",
    desc: "Fotopolimerizadores, turbinas, micromotor e equipos odontológicos.",
  },
  {
    icon: Syringe,
    title: "Anestesia",
    desc: "Seringas carpule, agulhas e tubetes de anestésicos.",
  },
  {
    icon: Package,
    title: "Kits & Conjuntos",
    desc: "Kits prontos para cada semestre, montados por quem já passou.",
  },
  {
    icon: Users,
    title: "Comunidade estudantil",
    desc: "Negociação direta entre estudantes de odontologia de todo o Brasil.",
  },
]

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Crie sua conta",
    desc: "Cadastro gratuito com seu e-mail em menos de 1 minuto.",
  },
  {
    step: "02",
    title: "Publique ou explore",
    desc: "Anuncie o que você não usa mais ou encontre o que precisa a preço justo.",
  },
  {
    step: "03",
    title: "Negocie diretamente",
    desc: "Entre em contato com o vendedor e acerte o melhor negócio.",
  },
]

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  function toggleMute() {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setMuted(videoRef.current.muted)
  }

  return (
    <div className="flex flex-col bg-background">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-white to-accent/20 border-b border-border/40">
        {/* círculos decorativos */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary/6 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 size-72 rounded-full bg-accent/20 blur-2xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28 flex flex-col lg:flex-row items-center gap-12">
          {/* Texto */}
          <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 self-center lg:self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wide">
              <Sparkles className="size-3" />
              Marketplace de odontologia
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Equipamentos odontológicos{" "}
              <span className="text-primary">sem pesar no bolso</span>
            </h1>

            <p className="text-muted-foreground text-lg max-w-lg mx-auto lg:mx-0">
              Compre, venda e troque instrumentais, materiais e equipamentos com outros estudantes de odontologia do Brasil.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button asChild size="lg" className="gap-2 shadow-md text-base px-8">
                <Link href="/register">
                  Começar agora
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/70 text-base px-8">
                <Link href="/login">Já tenho conta</Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Gratuito · Sem taxas · Aberto para todos os estudantes de odontologia
            </p>
          </div>

          {/* Vídeo vertical no lugar da ilustração */}
          <div className="shrink-0 flex items-center justify-center relative">
            {/* Glow de fundo */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-primary/20 blur-2xl scale-110 pointer-events-none" />
            <div className="relative w-52 sm:w-64 lg:w-60 xl:w-64 rounded-[2.2rem] overflow-hidden border-2 border-white/60 shadow-2xl shadow-primary/30"
              style={{ aspectRatio: "9/16" }}>
              <video
                ref={videoRef}
                src="/video_landing.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover scale-[1.35] object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIAS ───────────────────────────────────── */}
      <section className="py-16 bg-white border-b border-border/40">
        <div className="mx-auto max-w-6xl px-6 flex flex-col gap-10">
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">O que você encontra aqui</h2>
            <p className="text-muted-foreground text-sm">Tudo que um estudante de odonto precisa, direto de quem já passou.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background p-5 hover:border-primary/30 hover:bg-primary/3 transition-colors">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-sm text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ─────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-b from-background to-primary/5">
        <div className="mx-auto max-w-6xl px-6 flex flex-col gap-10">
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Como funciona</h2>
            <p className="text-muted-foreground text-sm">Simples, rápido e sem complicação.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col gap-4 rounded-xl bg-white border border-border/50 p-6 shadow-sm">
                <span className="text-4xl font-black text-primary/20 leading-none">{step}</span>
                <div className="flex flex-col gap-1.5">
                  <p className="font-bold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────── */}
      <section className="py-16 bg-primary">
        <div className="mx-auto max-w-3xl px-6 flex flex-col items-center gap-6 text-center">
          <ToothIcon className="size-12 text-white/40" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Pronto para economizar na faculdade?
          </h2>
          <p className="text-primary-foreground/70 text-sm max-w-md">
            Crie sua conta gratuita e comece a explorar os anúncios dos seus colegas agora mesmo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-md gap-2 px-8">
              <Link href="/register">
                Criar conta gratuita
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-white hover:bg-white/10 px-8">
              <Link href="/login">Fazer login</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
