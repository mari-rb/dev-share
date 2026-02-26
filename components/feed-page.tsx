"use client"

import { useState, useEffect, useCallback } from "react"
import { TipCard } from "./tip-card"
import { getTips, getSavedIds, toggleSaved } from "@/lib/storage"
import { dispatchQoeStep } from "@/lib/qoe"
import { CATEGORIES, type Category, type Tip } from "@/lib/types"
import { cn } from "@/lib/utils"

export function FeedPage() {
  const [tips, setTips] = useState<Tip[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [activeFilter, setActiveFilter] = useState<Category | "Todas">("Todas")

  useEffect(() => {
    setTips(getTips())
    setSavedIds(getSavedIds())
    dispatchQoeStep("explorar-salvar", "inicio-feed")
  }, [])

  const handleToggleSave = useCallback((tipId: string) => {
    const nowSaved = toggleSaved(tipId)
    setSavedIds(getSavedIds())
    dispatchQoeStep("explorar-salvar", nowSaved ? "salvar-dica" : "remover-dica")
  }, [])

  const filtered =
    activeFilter === "Todas"
      ? tips
      : tips.filter((t) => t.category === activeFilter)

  return (
    <div data-testid="feed-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Explorar Dicas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Descubra dicas de profissionais de tech
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por categoria">
        <button
          role="tab"
          aria-selected={activeFilter === "Todas"}
          onClick={() => setActiveFilter("Todas")}
          data-testid="filter-todas"
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            activeFilter === "Todas"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          Todas
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeFilter === cat}
            onClick={() => {
              setActiveFilter(cat)
              dispatchQoeStep("explorar-salvar", `filtro-${cat.toLowerCase()}`)
            }}
            data-testid={`filter-${cat.toLowerCase()}`}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              activeFilter === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma dica encontrada nesta categoria.
          </p>
        ) : (
          filtered.map((tip) => (
            <TipCard
              key={tip.id}
              tip={tip}
              isSaved={savedIds.includes(tip.id)}
              onToggleSave={handleToggleSave}
            />
          ))
        )}
      </div>
    </div>
  )
}
