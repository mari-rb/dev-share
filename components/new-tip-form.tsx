"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { addTip, getProfile } from "@/lib/storage";
import { dispatchQoeStep } from "@/lib/qoe";
import { CATEGORIES, ALL_TOOLS, type Category, type Tip } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, Sparkles, Code2, Wand2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function NewTipForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("Dev");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    dispatchQoeStep("postar-dica", "inicio-fluxo");
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const formatAsCode = () => {
    // Detectar blocos de código já formatados e linhas comuns para converter
    const lines = content.split("\n");
    let formatted = "";
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Se a linha começa com ``` ou é uma linha de código detectada
      if (trimmed.startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        formatted += line + "\n";
      } else if (
        !inCodeBlock &&
        trimmed.length > 0 &&
        // Detecta padrões comuns de código
        (/^[a-zA-Z_$][\w$]*\s*[=({]/.test(trimmed) || // Atribuições e definições
          /^\s*(function|class|const|let|var|if|for|while|return|import|export)/.test(
            trimmed,
          ) || // Palavras-chave
          (/[{}()\[\];:]/.test(trimmed) && trimmed.length > 20)) // Sintaxe de código
      ) {
        // Detectar linguagem pelo contexto
        let language = "";
        if (/^import|^export|=>|async/.test(trimmed)) language = "javascript";
        else if (/^class |^def |^if __name__/.test(trimmed))
          language = "python";
        else if (/^#include|^int main/.test(trimmed)) language = "cpp";
        else if (/^func |^var |^let/.test(trimmed)) language = "swift";

        // Se encontrou uma linha de código e ainda não está em bloco, iniciar bloco
        if (!inCodeBlock && i > 0 && lines[i - 1].trim() !== "") {
          formatted += "\n";
        }

        // Abrir bloco de código se não estiver aberto
        if (!inCodeBlock && /[{}()\[\];:]/.test(trimmed)) {
          formatted += "```" + language + "\n";
          inCodeBlock = true;
        }

        formatted += line + "\n";

        // Fechar bloco se for última linha de código
        if (
          inCodeBlock &&
          (i === lines.length - 1 || lines[i + 1].trim() === "")
        ) {
          formatted += "```\n";
          inCodeBlock = false;
        }
      } else {
        formatted += line + "\n";
      }
    }

    // Fechar bloco aberto
    if (inCodeBlock) {
      formatted = formatted.trimEnd() + "\n```";
    }

    setContent(formatted.trimEnd());
    dispatchQoeStep("postar-dica", "formatacao-codigo");
  };

  const wrapSelection = () => {
    // Funcionalidade para envolver seleção em ``` ``` para formatação rápida
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (!selectedText) {
      // Se nada está selecionado, envolver tudo
      setContent(`\`\`\`javascript\n${content}\n\`\`\``);
    } else {
      // Envolver apenas a seleção
      const newContent =
        content.substring(0, start) +
        "```\n" +
        selectedText +
        "\n```" +
        content.substring(end);
      setContent(newContent);
    }

    dispatchQoeStep("postar-dica", "envolvimento-codigo");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatchQoeStep("postar-dica", "clique-submit");

    // Problema de usabilidade proposital: delay de 6s sem feedback visual
    setTimeout(() => {
      const profile = getProfile();
      const newTip: Tip = {
        id: `tip-${Date.now()}`,
        title,
        content,
        category,
        tags: selectedTags,
        authorId: profile?.id || "anonymous",
        authorName: profile?.name || "Anonimo",
        authorArea: profile?.area || "Dev",
        createdAt: new Date().toISOString(),
        reactions: {
          "\uD83D\uDC4D": 0,
          "\uD83D\uDD25": 0,
          "\uD83E\uDD2F": 0,
          "\uD83D\uDCA1": 0,
        },
        comments: [],
      };

      addTip(newTip);
      dispatchQoeStep("postar-dica", "confirmacao-postagem");
      setPosted(true);

      // Problema de usabilidade proposital: após confirmação, volta ao formulário sem limpar campos
      setTimeout(() => {
        setPosted(false);
        // Campos permanecem preenchidos, deixando usuário em dúvida
      }, 1200);
    }, 6000);
  };

  if (posted) {
    return (
      <div
        data-testid="tip-confirmation"
        className="flex flex-col items-center justify-center gap-4 py-20"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Dica publicada!
        </h2>
        <p className="text-sm text-muted-foreground">
          Redirecionando para o feed...
        </p>
      </div>
    );
  }

  return (
    <div data-testid="new-tip-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Postar Dica
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compartilhe seu conhecimento com a comunidade
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4">
            <div>
              <Label
                htmlFor="title"
                className="mb-1.5 block text-sm text-card-foreground"
              >
                Titulo
              </Label>
              <Input
                id="title"
                data-testid="input-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  dispatchQoeStep("postar-dica", "preenchimento-titulo");
                }}
                placeholder="Ex: Como otimizar queries SQL com indices"
                required
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <Label
                  htmlFor="content"
                  className="text-sm font-medium text-card-foreground"
                >
                  Conteudo
                </Label>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    onClick={wrapSelection}
                    data-testid="btn-wrap-code"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Envolver</span>
                    <span className="sm:hidden">Envolver</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-testid="btn-format-dropdown"
                        className="gap-1"
                      >
                        <Wand2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Formatar</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={formatAsCode}
                        data-testid="format-auto"
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        Detectar automaticamente
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          const textarea = document.getElementById(
                            "content",
                          ) as HTMLTextAreaElement;
                          if (textarea) {
                            setContent(
                              `\`\`\`javascript\n${textarea.value}\n\`\`\``,
                            );
                            dispatchQoeStep(
                              "postar-dica",
                              "formato-javascript",
                            );
                          }
                        }}
                        data-testid="format-javascript"
                      >
                        <Code2 className="mr-2 h-4 w-4" />
                        JavaScript
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const textarea = document.getElementById(
                            "content",
                          ) as HTMLTextAreaElement;
                          if (textarea) {
                            setContent(
                              `\`\`\`python\n${textarea.value}\n\`\`\``,
                            );
                            dispatchQoeStep("postar-dica", "formato-python");
                          }
                        }}
                        data-testid="format-python"
                      >
                        <Code2 className="mr-2 h-4 w-4" />
                        Python
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const textarea = document.getElementById(
                            "content",
                          ) as HTMLTextAreaElement;
                          if (textarea) {
                            setContent(`\`\`\`bash\n${textarea.value}\n\`\`\``);
                            dispatchQoeStep("postar-dica", "formato-bash");
                          }
                        }}
                        data-testid="format-bash"
                      >
                        <Code2 className="mr-2 h-4 w-4" />
                        Bash
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const textarea = document.getElementById(
                            "content",
                          ) as HTMLTextAreaElement;
                          if (textarea) {
                            setContent(`\`\`\`sql\n${textarea.value}\n\`\`\``);
                            dispatchQoeStep("postar-dica", "formato-sql");
                          }
                        }}
                        data-testid="format-sql"
                      >
                        <Code2 className="mr-2 h-4 w-4" />
                        SQL
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="relative">
                <Textarea
                  id="content"
                  data-testid="input-content"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    dispatchQoeStep("postar-dica", "preenchimento-conteudo");
                  }}
                  placeholder={
                    "Escreva sua dica aqui...\n\nUse ```codigo``` para blocos de codigo"
                  }
                  className="min-h-48 font-mono text-sm"
                  required
                />
                <Sparkles className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground/50" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {
                  "Use ```linguagem``` para blocos de código ou clique em 'Formatar' para detectar automaticamente"
                }
              </p>
            </div>

            <div>
              <Label className="mb-2 block text-sm text-card-foreground">
                Categoria
              </Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    data-testid={`cat-${cat.toLowerCase()}`}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      category === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <Label className="mb-3 block text-sm text-card-foreground">
            Tags
          </Label>
          <div className="flex flex-wrap gap-2">
            {ALL_TOOLS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                data-testid={`tag-${tag.toLowerCase().replace(/[\s.]/g, "-")}`}
                className="transition-colors"
              >
                <Badge
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer",
                    selectedTags.includes(tag) &&
                      "bg-primary text-primary-foreground",
                  )}
                >
                  {tag}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          data-testid="submit-tip"
          disabled={!title.trim() || !content.trim()}
          className="w-full"
          size="lg"
        >
          Publicar Dica
        </Button>
      </form>
    </div>
  );
}

