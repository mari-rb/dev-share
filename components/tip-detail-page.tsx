"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { TipContentRenderer } from "./tip-content-renderer"
import { getTips, updateTip, getProfile, getSavedIds, toggleSaved } from "@/lib/storage"
import { dispatchQoeStep } from "@/lib/qoe"
import { REACTION_EMOJIS } from "@/lib/types"
import type { Tip, Comment } from "@/lib/types"
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  Send,
  Clock,
} from "lucide-react"

interface TipDetailPageProps {
  tipId: string
}

export function TipDetailPage({ tipId }: TipDetailPageProps) {
  const router = useRouter()
  const [tip, setTip] = useState<Tip | null>(null)
  const [commentText, setCommentText] = useState("")
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    dispatchQoeStep("comentar-reagir", "inicio-fluxo")
    const tips = getTips()
    const found = tips.find((t) => t.id === tipId)
    if (found) {
      setTip(found)
    }
    setIsSaved(getSavedIds().includes(tipId))
  }, [tipId])

  const handleReaction = (emoji: string) => {
    if (!tip) return
    const updated = {
      ...tip,
      reactions: {
        ...tip.reactions,
        [emoji]: (tip.reactions[emoji] || 0) + 1,
      },
    }
    updateTip(updated)
    setTip(updated)
    dispatchQoeStep("comentar-reagir", `reacao-${emoji}`)
  }

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tip || !commentText.trim()) return

    dispatchQoeStep("comentar-reagir", "clique-submit-comentario")
    const profile = getProfile()
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      authorName: profile?.name || "Anonimo",
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
    }

    const updated = {
      ...tip,
      comments: [...tip.comments, newComment],
    }
    updateTip(updated)
    setTip(updated)
    setCommentText("")
    dispatchQoeStep("comentar-reagir", "confirmacao-comentario")
  }

  const handleToggleSave = () => {
    const nowSaved = toggleSaved(tipId)
    setIsSaved(nowSaved)
  }

  if (!tip) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  const formattedDate = new Date(tip.createdAt).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div data-testid="tip-detail-screen">
      <button
        onClick={() => router.back()}
        data-testid="back-button"
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <article className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{tip.category}</Badge>
          {tip.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="mb-3 text-xl font-bold leading-snug text-balance text-card-foreground md:text-2xl">
          {tip.title}
        </h1>

        <div className="mb-5 flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {tip.authorName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-card-foreground">
              {tip.authorName}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{tip.authorArea}</span>
              <span className="text-border">|</span>
              <Clock className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <TipContentRenderer content={tip.content} />
        </div>

        <div className="flex items-center gap-2 border-t border-border pt-4">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              data-testid={`reaction-${emoji}`}
              className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-sm transition-colors hover:bg-secondary/80"
            >
              <span>{emoji}</span>
              <span className="text-xs font-medium text-secondary-foreground">
                {tip.reactions[emoji] || 0}
              </span>
            </button>
          ))}

          <div className="ml-auto">
            <button
              onClick={handleToggleSave}
              data-testid="detail-save-btn"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {isSaved ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              {isSaved ? "Salvo" : "Salvar"}
            </button>
          </div>
        </div>
      </article>

      <section className="mt-6" aria-label="Comentarios">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            Comentarios ({tip.comments.length})
          </h2>
        </div>

        <form
          onSubmit={handleComment}
          className="mb-6 flex gap-3"
          data-testid="comment-form"
        >
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escreva um comentario..."
            data-testid="input-comment"
            className="min-h-12 flex-1"
          />
          <Button
            type="submit"
            size="icon"
            data-testid="submit-comment"
            disabled={!commentText.trim()}
            className="shrink-0 self-end"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar comentario</span>
          </Button>
        </form>

        <div className="flex flex-col gap-3">
          {tip.comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum comentario ainda. Seja o primeiro!
            </p>
          ) : (
            tip.comments.map((comment) => (
              <div
                key={comment.id}
                data-testid={`comment-${comment.id}`}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                    {comment.authorName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <span className="text-sm font-medium text-card-foreground">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/85">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
