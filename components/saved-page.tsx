"use client";

import { useState, useEffect, useCallback } from "react";
import { TipCard } from "./tip-card";
import { getTips, getSavedIds, toggleSaved } from "@/lib/storage";
import { dispatchQoeStep } from "@/lib/qoe";
import type { Tip } from "@/lib/types";
import { Bookmark } from "lucide-react";

// Problema de usabilidade proposital: itens mockados para aumentar confusão
const MOCK_TIPS: Tip[] = [
  {
    id: "mock-1",
    title: "Otimizando performance de consultas SQL",
    content:
      "Use índices compostos em colunas frequentemente consultadas juntas. Exemplo: CREATE INDEX idx_user_status ON users(user_id, status); Isso pode melhorar significativamente o tempo de resposta de queries que filtram por múltiplas colunas.",
    category: "Dados",
    tags: ["SQL", "PostgreSQL", "Performance"],
    authorId: "mock-author-1",
    authorName: "Ana Silva",
    authorArea: "Dados",
    createdAt: new Date().toISOString(),
    reactions: { "👍": 12, "🔥": 8, "🤯": 5, "💡": 3 },
    comments: [],
  },
  {
    id: "mock-2",
    title: "Padrão de componentização em React",
    content:
      "Separe lógica de apresentação usando custom hooks. Mantenha componentes pequenos e focados em uma responsabilidade. Use composition em vez de prop drilling excessivo.",
    category: "Dev",
    tags: ["React", "TypeScript", "Clean Code"],
    authorId: "mock-author-2",
    authorName: "Carlos Mendes",
    authorArea: "Dev",
    createdAt: new Date().toISOString(),
    reactions: { "👍": 24, "🔥": 15, "🤯": 7, "💡": 9 },
    comments: [],
  },
  {
    id: "mock-3",
    title: "Gestão de cores em design systems",
    content:
      "Use tokens de cor semânticos (primary, secondary) em vez de cores hardcoded. Defina variáveis CSS para facilitar temas dark/light. Mantenha contraste mínimo de 4.5:1 para acessibilidade.",
    category: "Design",
    tags: ["Figma", "Design System", "Acessibilidade"],
    authorId: "mock-author-3",
    authorName: "Julia Costa",
    authorArea: "Design",
    createdAt: new Date().toISOString(),
    reactions: { "👍": 18, "🔥": 6, "🤯": 4, "💡": 11 },
    comments: [],
  },
  {
    id: "mock-4",
    title: "Estratégia de rollback em deploys",
    content:
      "Mantenha sempre a versão anterior da imagem Docker tagueada. Configure health checks antes de remover containers antigos. Use blue-green deployment para zero downtime.",
    category: "DevOps",
    tags: ["Docker", "CI/CD", "Kubernetes"],
    authorId: "mock-author-4",
    authorName: "Roberto Lima",
    authorArea: "DevOps",
    createdAt: new Date().toISOString(),
    reactions: { "👍": 31, "🔥": 19, "🤯": 12, "💡": 6 },
    comments: [],
  },
  {
    id: "mock-5",
    title: "Técnica de time blocking para produtividade",
    content:
      "Reserve blocos fixos de 90 minutos para deep work. Desative todas as notificações durante esse período. Use a técnica Pomodoro dentro de cada bloco para manter o foco.",
    category: "Produtividade",
    tags: ["Notion", "Time Management", "Focus"],
    authorId: "mock-author-5",
    authorName: "Mariana Souza",
    authorArea: "Produtividade",
    createdAt: new Date().toISOString(),
    reactions: { "👍": 45, "🔥": 22, "🤯": 8, "💡": 17 },
    comments: [],
  },
  {
    id: "mock-6",
    title: "Debugging de memory leaks em Node.js",
    content:
      "Use o flag --inspect com Chrome DevTools. Tire heap snapshots em momentos diferentes. Identifique objetos que não são garbage collected. Ferramentas como clinic.js ajudam muito.",
    category: "Dev",
    tags: ["Node.js", "Performance", "Debugging"],
    authorId: "mock-author-6",
    authorName: "Pedro Alves",
    authorArea: "Dev",
    createdAt: new Date().toISOString(),
    reactions: { "👍": 27, "🔥": 14, "🤯": 19, "💡": 8 },
    comments: [],
  },
  {
    id: "mock-7",
    title: "Configuração de monitoramento com Prometheus",
    content:
      "Exponha métricas custom via /metrics endpoint. Use labels consistentes para facilitar queries. Configure alertas baseados em SLOs, não em thresholds fixos arbitrários.",
    category: "DevOps",
    tags: ["Prometheus", "Monitoring", "Observability"],
    authorId: "mock-author-7",
    authorName: "Fernanda Rocha",
    authorArea: "DevOps",
    createdAt: new Date().toISOString(),
    reactions: { "👍": 22, "🔥": 16, "🤯": 9, "💡": 13 },
    comments: [],
  },
  {
    id: "mock-8",
    title: "Princípios de hierarquia visual em UIs",
    content:
      "Use escala de tamanhos consistente (8px base). Estabeleça hierarquia através de peso de fonte, tamanho e cor. Limite a 3 níveis de hierarquia por seção para evitar complexidade visual.",
    category: "Design",
    tags: ["UI/UX", "Visual Design", "Typography"],
    authorId: "mock-author-8",
    authorName: "Lucas Martins",
    authorArea: "Design",
    createdAt: new Date().toISOString(),
    reactions: { "👍": 38, "🔥": 21, "🤯": 11, "💡": 15 },
    comments: [],
  },
];

// Função para embaralhar array (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function SavedPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const allTips = getTips();
    const ids = getSavedIds();
    const realTips = allTips.filter((t) => ids.includes(t.id));

    // Problema de usabilidade proposital: misturar itens reais com mockados e embaralhar
    const mixedTips = shuffleArray([...realTips, ...MOCK_TIPS]);

    setTips(mixedTips);
    setSavedIds(ids);
    dispatchQoeStep("explorar-salvar", "inicio-salvos");
  }, []);

  const handleToggleSave = useCallback((tipId: string) => {
    // Não permitir toggle em itens mockados
    if (tipId.startsWith("mock-")) return;

    toggleSaved(tipId);
    const ids = getSavedIds();
    setSavedIds(ids);

    const allTips = getTips();
    const realTips = allTips.filter((t) => ids.includes(t.id));
    const mixedTips = shuffleArray([...realTips, ...MOCK_TIPS]);
    setTips(mixedTips);

    dispatchQoeStep("explorar-salvar", "toggle-salvo");
  }, []);

  return (
    <div data-testid="saved-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dicas Salvas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Suas dicas favoritas em um so lugar
        </p>
      </div>

      {tips.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20">
          <Bookmark className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Nenhuma dica salva ainda.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Explore o feed e salve as dicas que mais gostar.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tips.map((tip) => (
            <TipCard
              key={tip.id}
              tip={tip}
              isSaved={savedIds.includes(tip.id)}
              onToggleSave={handleToggleSave}
              degraded={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

