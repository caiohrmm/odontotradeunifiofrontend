"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, MessageCircle, User, Send, Check, CheckCheck, Trash2, Paperclip, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { chatApi, uploadApi, type ChatRoom, type ChatMessage } from "@/lib/api"
import { Client, IMessage } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
})

function InboxContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const initRoomId = searchParams.get("roomId")
  
  // State
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState("")
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [unreadRooms, setUnreadRooms] = useState<Set<string>>(new Set())
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeRoomRef = useRef<ChatRoom | null>(null)

  useEffect(() => {
    activeRoomRef.current = activeRoom
  }, [activeRoom])

  // 1. Fetch ALL rooms and initialize Stomp connection
  useEffect(() => {
    if (!user) return

    let client: Client | null = null

    chatApi.getUserRooms(user.userId)
      .then((data) => {
        const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setRooms(sorted)

        // Se veio direcionado de um anúncio
        if (initRoomId) {
          const target = sorted.find(r => r.id === initRoomId)
          if (target) {
            setActiveRoom(target)
            // Remove o parâmetro da URL silenciosamente e sem recarregar a tela
            router.replace("/profile/chats", { scroll: false })
          }
        }

        client = new Client({
          webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
          reconnectDelay: 2000,
          onConnect: () => {
            setIsConnected(true)
            sorted.forEach((r) => {
              client!.subscribe(`/topic/room/${r.id}`, (msg: IMessage) => {
                const parsed: ChatMessage = JSON.parse(msg.body)
                
                if (activeRoomRef.current?.id === r.id) {
                  setMessages((prev) => {
                    if (parsed.id && prev.some((m) => m.id === parsed.id)) return prev
                    return [...prev, parsed]
                  })
                } else {
                  if (parsed.senderId !== user.userId) {
                    setUnreadRooms(prev => {
                      const next = new Set(prev)
                      next.add(r.id)
                      return next
                    })
                    toast.success(`Nova mensagem em ${r.listingTitle || "anúncio"}!`, {
                      description: parsed.content.startsWith("[IMAGEM]") ? "🖼️ Imagem recebida" : parsed.content,
                      action: {
                        label: "Ver",
                        onClick: () => setActiveRoom(r)
                      }
                    })
                  }
                }
              })
            })
          },
          onWebSocketClose: () => setIsConnected(false),
          onStompError: () => setIsConnected(false),
        })

        client.activate()
        setStompClient(client)
      })
      .catch((err) => console.error("Falha ao buscar as salas", err))
      .finally(() => setLoading(false))

    // Cleanup na desmontagem da tela
    return () => {
      if (client) {
        client.deactivate()
      }
    }
  }, [user, initRoomId, router])

  // 2. Quando o usuário clica numa sala, busca o *histórico*
  useEffect(() => {
    if (!activeRoom) {
      setMessages([])
      return
    }

    setMessages([])
    chatApi.getRoomMessages(activeRoom.id)
      .then((history) => {
        setMessages(history || [])
        setTimeout(() => inputRef.current?.focus(), 100)
      })
      .catch((err) => console.error("Falha ao puxar histórico do chat", err))
  }, [activeRoom])

  // 3. Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (!user) return null

  function internalSendMsg(content: string) {
    if (!stompClient || !activeRoom || !isConnected) return
    stompClient.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify({
        roomId: activeRoom.id,
        senderId: user!.userId,
        content: content,
      }),
    })
  }

  function send(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    internalSendMsg(text.trim())
    setText("")
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const res = await uploadApi.upload(file)
      // Manda a url com prefixo para identificar a imagem
      internalSendMsg(`[IMAGEM] ${res.url}`)
    } catch (err) {
      console.error(err)
      toast.error("Erro ao enviar anexo")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleDeleteRoom(roomId: string, e: React.MouseEvent) {
    e.stopPropagation() // Não selecionar a sala como ativa
    if (!confirm("Tem certeza que deseja apagar essa conversa para sempre?")) return
    
    try {
      await chatApi.deleteRoom(roomId)
      setRooms(prev => prev.filter(r => r.id !== roomId))
      if (activeRoom?.id === roomId) {
        setActiveRoom(null)
      }
      toast.success("Conversa apagada com sucesso.")
    } catch(err) {
        console.error(err)
        toast.error("Erro ao tentar apagar a conversa.")
    }
  }

  const dentalPatternURI = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 40 40' opacity='0.10' fill='%23047857'%3E%3Cpath transform='translate(8,8)' d='M17.5 2c-1.3 0-2.3.8-3 2c-.3.6-1.7.6-2 0-.7-1.2-1.7-2-3-2C6.5 2 4 4.5 4 7.5v2c0 2 .5 4 1.5 5.5l1.5 8c.2.8.8 1 1.5 1 .8 0 1.5-.5 1.5-1v-4c0-.5.5-1 1-1s1 .5 1 1v4c0 .5.7 1 1.5 1 .7 0 1.3-.2 1.5-1l1.5-8c1-1.5 1.5-3.5 1.5-5.5v-2C21 4.5 18.5 2 17.5 2z'/%3E%3C/svg%3E"

  return (
    <div className="flex w-full min-w-0 overflow-hidden sm:flex-row flex-col h-full relative">
      
      {/* Left Pane: Sidebar List */}
      <div className={cn(
        "flex flex-col border-r border-border/40 bg-zinc-50 sm:w-80 md:w-96 shrink-0 transition-all h-full",
        activeRoom ? "hidden sm:flex" : "flex flex-1"
      )}>
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 bg-white px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="flex size-9 items-center justify-center rounded-full hover:bg-muted transition-colors sm:hidden"
            >
              <ArrowLeft className="size-4 text-muted-foreground" />
            </Link>
            <h1 className="text-lg font-bold text-foreground">Aba de Negociações</h1>
          </div>
          <div className={cn("size-2.5 rounded-full", isConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" : "bg-red-500 animate-pulse")} 
                title={isConnected ? "Online" : "Conectando..."} />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Sincronizando chats...
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-sm text-muted-foreground">
              <MessageCircle className="size-10 text-muted-foreground/30" />
              Nenhuma negociação em andamento.
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {rooms.map((room) => {
                const isSeller = user.userId === room.sellerId
                const title = room.listingTitle || room.listing?.title || "Anúncio indisponível"
                const otherPartyName = isSeller ? "Comprador(a)" : "Vendedor(a)"
                const isActive = activeRoom?.id === room.id
                const hasNew = unreadRooms.has(room.id)

                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      setActiveRoom(room)
                      if (hasNew) {
                        setUnreadRooms(prev => {
                          const next = new Set(prev)
                          next.delete(room.id)
                          return next
                        })
                      }
                    }}
                    className={cn(
                      "group flex items-center gap-3 w-full rounded-xl p-3 text-left transition-colors cursor-pointer relative overflow-hidden",
                      isActive ? "bg-primary/10 text-primary" : hasNew ? "bg-red-50" : "hover:bg-muted/60 bg-transparent"
                    )}
                  >
                    <div className={cn(
                      "flex size-11 flex-shrink-0 items-center justify-center rounded-full transition-colors",
                      isActive ? "bg-primary/20 text-primary" : hasNew ? "bg-red-100 text-red-500" : "bg-muted text-muted-foreground"
                    )}>
                      <User className="size-5" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center pr-6">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "truncate text-sm",
                          isActive ? "font-semibold text-primary" : hasNew ? "font-bold text-red-600" : "font-semibold text-foreground"
                        )}>
                          {title}
                        </span>
                        {hasNew && <div className="size-2.5 rounded-full bg-red-500 shrink-0 ml-1 shadow-sm" />}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="truncate text-xs text-muted-foreground">
                          {otherPartyName}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">
                          {new Date(room.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Delete button (Always visible on mobile, semi-visible on desktop, full red on hover) */}
                    <div 
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 group-hover:opacity-100 transition-opacity bg-transparent p-1.5 rounded-full hover:bg-destructive hover:text-white"
                      onClick={(e) => handleDeleteRoom(room.id, e)}
                      title="Apagar conversa"
                    >
                      <Trash2 className="size-4" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat Content */}
      <div className={cn(
        "flex-1 flex-col sm:flex bg-white h-full relative",
        !activeRoom ? "hidden" : "flex"
      )}>
        {!activeRoom ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 opacity-50 bg-[#fbfbfb]" style={{ backgroundImage: `url("${dentalPatternURI}")` }}>
            <div className="flex flex-col items-center text-center bg-white/90 p-8 rounded-3xl shadow-xs border border-border/40 backdrop-blur-sm">
              <MessageCircle className="size-16 text-primary mb-2 opacity-80" />
              <p className="font-semibold text-lg text-foreground mb-1">Bem-vindo(a) ao Chat</p>
              <p className="text-sm text-muted-foreground max-w-xs">Selecione uma negociação no menu ao lado para interagir em tempo real.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 bg-white px-4 shadow-[0_4px_12px_rgba(0,0,0,0.02)] z-10">
              <div className="flex items-center gap-3 overflow-hidden">
                <button
                  onClick={() => setActiveRoom(null)}
                  className="flex size-9 items-center justify-center rounded-full hover:bg-muted transition-colors sm:hidden"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="size-4.5" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {activeRoom.listingTitle || activeRoom.listing?.title || "Conversa"}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground/80 font-medium">
                    {user.userId === activeRoom.sellerId ? "Você é o Vendedor desta negociação" : "Você é o Comprador nesta negociação"}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={(e) => handleDeleteRoom(activeRoom.id, e)}
                className="size-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Deletar este chat"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            {/* Mensagens do chat */}
            <div className="flex-1 overflow-y-auto px-4 py-6 font-sans relative" 
                  style={{ backgroundColor: '#f0f4f8', backgroundImage: `url("${dentalPatternURI}")` }}>
              
              <div className="flex flex-col gap-1 relative z-10">
                {messages.length === 0 && (
                  <div className="flex w-full items-center justify-center my-6 text-sm text-emerald-800">
                    <div className="rounded-2xl bg-emerald-100/90 px-6 py-4 shadow-xs border border-emerald-200/50 text-center font-medium max-w-[280px]">
                      🤝 Bate-papo iniciado! Manda um \"Oi\" ou utilize os atalhos rápidos ali embaixo.<br/>
                      <span className="text-xs text-emerald-700/80 mt-1 block">A mensagem fica gravada para o outro usuário ler quando puder! Não precisa esperar!</span>
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isMe = msg.senderId === user.userId
                  const timestamp = msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now()
                  
                  const prevTimestamp = i > 0 && messages[i - 1]?.createdAt 
                      ? new Date(messages[i - 1]!.createdAt!).getTime() 
                      : timestamp

                  const showDate = i === 0 || (timestamp - prevTimestamp > 5 * 60 * 1000)
                  
                  const isImage = msg.content.startsWith("[IMAGEM] ")
                  const contentStr = isImage ? msg.content.replace("[IMAGEM] ", "") : msg.content

                  return (
                    <div key={msg.id || i} className="flex flex-col">
                      {showDate && (
                        <div className="my-3 flex justify-center">
                          <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-medium text-slate-500 shadow-xs border border-border/40 backdrop-blur-md">
                            {dateFormatter.format(new Date(timestamp))}
                          </span>
                        </div>
                      )}
                      <div className={cn("flex w-full mb-1", isMe ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "group relative max-w-[85%] px-3.5 py-2 text-[15px] leading-relaxed shadow-sm md:max-w-[70%]",
                            isMe
                              ? "rounded-[18px] rounded-br-sm bg-primary text-primary-foreground"
                              : "rounded-[18px] rounded-tl-sm border border-border/50 bg-white text-foreground"
                          )}
                        >
                          {isImage ? (
                            <div 
                               className="mt-1 mb-1 rounded-xl overflow-hidden bg-white/5 relative min-h-[100px] min-w-[150px] cursor-pointer group"
                               onClick={() => setSelectedImage(contentStr)}
                               title="Clique para ampliar"
                            >
                              <img src={contentStr} alt="Anexo da conversa" className="object-cover max-h-[300px] w-auto max-w-full rounded-md group-hover:brightness-90 transition-all" />
                            </div>
                          ) : (
                            <p className="break-words">{contentStr}</p>
                          )}
                          
                          <div className="mt-1 flex items-center justify-end gap-1 px-1">
                            <span className={cn(
                              "text-[9px] font-medium tracking-wide",
                              isMe ? "text-primary-foreground/70" : "text-muted-foreground/60"
                            )}>
                              {dateFormatter.format(new Date(timestamp))}
                            </span>
                            {isMe && <CheckCheck className="size-3.5 text-blue-300 dark:text-blue-200" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </div>
            
            {/* Sugestões de Respostas Rápidas (Facebook Marketplace Style) */}
            <div className="flex shrink-0 gap-1.5 overflow-x-auto bg-[#f0f4f8] px-3 pb-1 pt-1 scrollbar-none z-10 relative">
              {(user.userId === activeRoom.sellerId 
                ? [
                    "Sim! Ainda está disponível.",
                    "Produto perfeito, quase não usei.",
                    "Podemos fechar negócio, sim.",
                    "Posso entregar na faculdade na quarta."
                  ]
                : [
                    "Olá! Ainda está disponível?",
                    "Faz um desconto especial?",
                    "Como tá o estado de conservação?",
                    "Podemos nos encontrar na UNIFIO?"
                  ]
                ).map((frase) => (
                  <button
                    key={frase}
                    type="button"
                    onClick={() => internalSendMsg(frase)}
                    className="shrink-0 whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-primary hover:text-white transition-colors"
                  >
                    {frase}
                  </button>
                ))
              }
            </div>

            {/* Input Overlay de Carregamento Imagem */}
            {uploading && (
              <div className="absolute inset-x-0 bottom-[68px] z-20 flex justify-center pb-2">
                <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-border/50 flex items-center gap-2 text-sm text-foreground animate-in slide-in-from-bottom-2 fade-in">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  Enviando anexo...
                </div>
              </div>
            )}

            {/* Campo para Digitar a Mensagem */}
            <form
              onSubmit={send}
              className="flex items-center gap-3 bg-[#f0f4f8] px-3 py-3 sm:px-4 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.02)] z-10"
            >
              
              <div className="flex flex-1 items-center bg-white rounded-full border border-border/50 shadow-xs focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all p-1">
                <button
                  type="button"
                  title="Enviar Imagem"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || !isConnected}
                  className="size-10 shrink-0 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors ml-0.5"
                >
                  <Paperclip className="size-4" />
                </button>
                <input 
                   type="file" 
                   accept="image/*" 
                   className="hidden" 
                   ref={fileInputRef} 
                   onChange={handleFileUpload} 
                />

                <Input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={!isConnected ? "Reconectando..." : "Escreva sua mensagem..."}
                  className="flex-1 border-0 bg-transparent h-10 px-2 focus-visible:ring-0 shadow-none text-[15px]"
                  disabled={!isConnected || uploading}
                />
                
                <Button
                  type="submit"
                  size="icon"
                  disabled={!text.trim() || !isConnected || uploading}
                  className="size-9 rounded-full mr-1 bg-primary text-primary-foreground shrink-0 shadow-sm transition-transform active:scale-95"
                >
                  <Send className="size-4 ml-0.5" />
                </Button>
              </div>
            </form>
          </>
        )}

        {/* Modal de View de Imagem */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={() => setSelectedImage(null)}
              title="Fechar"
            >
              <X className="size-6" />
            </button>
            <img 
              src={selectedImage} 
              alt="Visualização ampliada" 
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200" 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function InboxPageContainer() {
  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[500px] min-w-0 w-full overflow-hidden rounded-xl border border-border/60 shadow-sm bg-white">
      <Suspense fallback={<div className="flex w-full items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>}>
        <InboxContent />
      </Suspense>
    </div>
  )
}
