"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Tip } from "@/lib/types";
import { REACTION_EMOJIS } from "@/lib/types";

interface TipCardProps {
  tip: Tip;
  isSaved: boolean;
  onToggleSave: (tipId: string) => void;
  degraded?: boolean;
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    Dev: "bg-chart-1/15 text-chart-1 border-chart-1/20",
    Design: "bg-chart-4/15 text-chart-4 border-chart-4/20",
    DevOps: "bg-chart-2/15 text-chart-2 border-chart-2/20",
    Dados: "bg-chart-3/15 text-chart-3 border-chart-3/20",
    Produtividade: "bg-chart-5/15 text-chart-5 border-chart-5/20",
  };
  return colors[category] || "";
}

export function TipCard({
  tip,
  isSaved,
  onToggleSave,
  degraded = false,
}: TipCardProps) {
  const preview = tip.content.slice(0, 140).replace(/[`#*\[\]]/g, "") + "...";
  const totalReactions = REACTION_EMOJIS.reduce(
    (sum, emoji) => sum + (tip.reactions[emoji] || 0),
    0,
  );

  // Problema de usabilidade proposital: versão degradada sem hierarquia visual
  if (degraded) {
    const flatText = `${tip.category} por ${tip.authorName} ${tip.authorArea} ${tip.title} ${preview} ${REACTION_EMOJIS.slice(0, 3).join(" ")} ${totalReactions} ${tip.comments.length} ${tip.tags.slice(0, 3).join(" ")}`;

    return (
      <article className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <Link
              href={`/tip/${tip.id}`}
              className="block"
              data-testid={`tip-link-${tip.id}`}
            >
              <p className="text-sm leading-relaxed text-muted-foreground">
                {flatText}
              </p>
            </Link>
          </div>

          <button
            onClick={() => onToggleSave(tip.id)}
            data-testid={`save-btn-${tip.id}`}
            className="mt-1 shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            aria-label={isSaved ? "Remover dos salvos" : "Salvar dica"}
          >
            {isSaved ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={getCategoryColor(tip.category)}>
              {tip.category}
            </Badge>
            <span className="text-xs text-muted-foreground">
              por {tip.authorName}
            </span>
            <Badge variant="secondary" className="text-xs">
              {tip.authorArea}
            </Badge>
          </div>

          <Link
            href={`/tip/${tip.id}`}
            className="block"
            data-testid={`tip-link-${tip.id}`}
          >
            <h3 className="mb-1.5 text-base font-semibold leading-snug text-card-foreground transition-colors group-hover:text-primary">
              {tip.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {preview}
            </p>
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {REACTION_EMOJIS.slice(0, 3).map((emoji) => (
                <span key={emoji}>{emoji}</span>
              ))}
              <span>{totalReactions}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{tip.comments.length}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {tip.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => onToggleSave(tip.id)}
          data-testid={`save-btn-${tip.id}`}
          className="mt-1 shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          aria-label={isSaved ? "Remover dos salvos" : "Salvar dica"}
        >
          {isSaved ? (
            <BookmarkCheck className="h-5 w-5 text-primary" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </button>
      </div>
    </article>
  );
}

