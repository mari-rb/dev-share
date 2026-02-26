import type { Tip } from "./types"

export const MOCK_TIPS: Tip[] = [
  {
    id: "tip-1",
    title: "Use React Server Components para reduzir o bundle JS",
    content: `Server Components permitem renderizar no servidor sem enviar JavaScript ao cliente.

\`\`\`tsx
// app/page.tsx — este componente roda apenas no servidor
export default async function Page() {
  const posts = await db.posts.findMany()
  return <PostList posts={posts} />
}
\`\`\`

Benefícios:
- Zero JavaScript enviado para o cliente
- Acesso direto ao banco de dados
- Melhor SEO e performance de carregamento

Combine com \`"use client"\` somente onde precisar de interatividade.`,
    category: "Dev",
    tags: ["React", "Next.js", "Performance"],
    authorId: "author-1",
    authorName: "Marina Silva",
    authorArea: "Dev",
    createdAt: "2026-02-15T10:00:00Z",
    reactions: { "👍": 24, "🔥": 18, "🤯": 5, "💡": 12 },
    comments: [
      { id: "c1", authorName: "Pedro Rocha", content: "Excelente dica! Reduziu meu bundle em 40%.", createdAt: "2026-02-15T12:00:00Z" }
    ]
  },
  {
    id: "tip-2",
    title: "Design Tokens: a base de qualquer Design System",
    content: `Design Tokens são variáveis que armazenam decisões de design (cores, espaçamentos, tipografia) de forma agnóstica a plataforma.

\`\`\`json
{
  "color": {
    "primary": { "value": "#0A84FF" },
    "surface": { "value": "#1C1C1E" }
  },
  "spacing": {
    "sm": { "value": "8px" },
    "md": { "value": "16px" }
  }
}
\`\`\`

Ferramentas como Style Dictionary transformam tokens em variáveis CSS, Swift, Kotlin, etc. Isso garante consistência entre web, iOS e Android.`,
    category: "Design",
    tags: ["Figma", "Design System", "Tokens"],
    authorId: "author-2",
    authorName: "Lucas Mendes",
    authorArea: "Design",
    createdAt: "2026-02-14T09:00:00Z",
    reactions: { "👍": 15, "🔥": 8, "🤯": 3, "💡": 20 },
    comments: []
  },
  {
    id: "tip-3",
    title: "Multi-stage Docker builds para imagens menores",
    content: `Use multi-stage builds para separar o ambiente de build do runtime. O resultado é uma imagem final muito menor.

\`\`\`dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
\`\`\`

Uma imagem Node.js pode cair de 1.2GB para ~150MB com essa abordagem.`,
    category: "DevOps",
    tags: ["Docker", "CI/CD", "Performance"],
    authorId: "author-3",
    authorName: "Ana Costa",
    authorArea: "DevOps",
    createdAt: "2026-02-13T14:00:00Z",
    reactions: { "👍": 30, "🔥": 22, "🤯": 8, "💡": 15 },
    comments: [
      { id: "c2", authorName: "Carlos Lima", content: "Funciona muito bem com GitHub Actions!", createdAt: "2026-02-13T16:00:00Z" }
    ]
  },
  {
    id: "tip-4",
    title: "Pandas: otimize com dtypes corretos",
    content: `Definir os dtypes corretos ao carregar dados pode reduzir o uso de memória em até 80%.

\`\`\`python
import pandas as pd

# Antes: 800MB em memória
df = pd.read_csv("vendas.csv")

# Depois: 160MB em memória
dtypes = {
    "id": "int32",
    "produto": "category",
    "valor": "float32",
    "quantidade": "int16"
}
df = pd.read_csv("vendas.csv", dtype=dtypes)

print(df.memory_usage(deep=True).sum() / 1e6, "MB")
\`\`\`

Use \`category\` para colunas com valores repetidos (como nomes de produtos, cidades, etc).`,
    category: "Dados",
    tags: ["Python", "Pandas", "Performance"],
    authorId: "author-4",
    authorName: "Rafael Oliveira",
    authorArea: "Dados",
    createdAt: "2026-02-12T08:00:00Z",
    reactions: { "👍": 18, "🔥": 10, "🤯": 12, "💡": 25 },
    comments: []
  },
  {
    id: "tip-5",
    title: "Zettelkasten: o segundo cérebro para devs",
    content: `O método Zettelkasten transforma anotações soltas em uma rede de conhecimento interconectado.

**Como funciona:**
1. Cada nota cobre UMA ideia
2. Notas são conectadas por links bidirecionais
3. Não existe hierarquia rígida — o conhecimento emerge das conexões

**Ferramentas recomendadas:**
- Obsidian (gratuito, local-first)
- Logseq (open source, baseado em blocos)

**Template básico:**
\`\`\`markdown
# [[React Server Components]]
- Renderizam no servidor sem JS no cliente
- Links: [[Performance Web]], [[Next.js 14]]
- Fonte: Documentação oficial React
- Minha opinião: game changer para apps data-heavy
\`\`\`

Após 3 meses usando, meus artigos técnicos ficaram 2x mais rápidos de escrever.`,
    category: "Produtividade",
    tags: ["Obsidian", "Notion", "Notas"],
    authorId: "author-5",
    authorName: "Julia Santos",
    authorArea: "Produtividade",
    createdAt: "2026-02-11T11:00:00Z",
    reactions: { "👍": 40, "🔥": 15, "🤯": 6, "💡": 35 },
    comments: [
      { id: "c3", authorName: "Marina Silva", content: "Uso Obsidian diariamente. Mudou minha forma de estudar.", createdAt: "2026-02-11T13:00:00Z" }
    ]
  },
  {
    id: "tip-6",
    title: "TypeScript: Utility Types que todo dev precisa conhecer",
    content: `TypeScript tem utility types nativos que evitam código repetitivo.

\`\`\`typescript
// Partial - torna todas as props opcionais
type UpdateUser = Partial<User>

// Pick - seleciona apenas certas propriedades
type UserPreview = Pick<User, "name" | "avatar">

// Omit - remove propriedades
type CreateUser = Omit<User, "id" | "createdAt">

// Record - cria um objeto tipado
type RolePermissions = Record<Role, Permission[]>

// ReturnType - extrai o tipo de retorno
type ApiResponse = ReturnType<typeof fetchUser>
\`\`\`

Combine com generics para criar tipos reutilizáveis:
\`\`\`typescript
type ApiResult<T> = {
  data: T | null
  error: string | null
  loading: boolean
}
\`\`\``,
    category: "Dev",
    tags: ["TypeScript", "Tipos", "DX"],
    authorId: "author-6",
    authorName: "Thiago Ferreira",
    authorArea: "Dev",
    createdAt: "2026-02-10T09:00:00Z",
    reactions: { "👍": 50, "🔥": 30, "🤯": 10, "💡": 28 },
    comments: []
  },
  {
    id: "tip-7",
    title: "Figma Auto Layout: pare de usar posicionamento absoluto",
    content: `Auto Layout no Figma funciona como Flexbox no CSS. Seus designs ficam responsivos e fáceis de manter.

**Regras de ouro:**
1. Todo frame deve ter Auto Layout
2. Use \`gap\` em vez de margins manuais
3. Defina \`padding\` no container, não nos filhos
4. Use \`fill container\` para elementos expansíveis

**Atalhos essenciais:**
- Shift+A: adicionar Auto Layout
- Alt+arrastar: duplicar com espaçamento
- Ctrl+D: repetir última ação

**Dica pro:** Crie um frame de "Spacing" com variantes (4px, 8px, 16px, 24px, 32px) e use como espaçador visual nos seus layouts.`,
    category: "Design",
    tags: ["Figma", "Layout", "UI"],
    authorId: "author-7",
    authorName: "Camila Rocha",
    authorArea: "Design",
    createdAt: "2026-02-09T15:00:00Z",
    reactions: { "👍": 22, "🔥": 18, "🤯": 4, "💡": 16 },
    comments: [
      { id: "c4", authorName: "Lucas Mendes", content: "Auto Layout mudou minha produtividade no Figma completamente.", createdAt: "2026-02-09T17:00:00Z" }
    ]
  },
  {
    id: "tip-8",
    title: "Terraform: gerenciando infraestrutura como código",
    content: `Terraform permite versionar e reproduzir toda sua infraestrutura cloud.

\`\`\`hcl
# main.tf
provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "data_lake" {
  bucket = "meu-data-lake-prod"

  tags = {
    Environment = "production"
    Team        = "data-engineering"
  }
}

resource "aws_iam_role" "lambda_role" {
  name = "lambda-execution-role"
  assume_role_policy = data.aws_iam_policy_document.lambda.json
}
\`\`\`

**Workflow:**
1. \`terraform init\` — inicializa providers
2. \`terraform plan\` — preview das mudanças
3. \`terraform apply\` — aplica mudanças
4. \`terraform destroy\` — remove tudo

Use Terraform Cloud ou S3 backend para state remoto em equipe.`,
    category: "DevOps",
    tags: ["Terraform", "AWS", "IaC"],
    authorId: "author-8",
    authorName: "Diego Almeida",
    authorArea: "DevOps",
    createdAt: "2026-02-08T10:00:00Z",
    reactions: { "👍": 28, "🔥": 16, "🤯": 5, "💡": 20 },
    comments: []
  },
  {
    id: "tip-9",
    title: "SQL Window Functions para análises avançadas",
    content: `Window Functions permitem cálculos sobre conjuntos de linhas relacionadas sem agrupar os dados.

\`\`\`sql
-- Ranking de vendedores por região
SELECT
  vendedor,
  regiao,
  total_vendas,
  RANK() OVER (
    PARTITION BY regiao
    ORDER BY total_vendas DESC
  ) AS ranking,
  -- Média móvel dos últimos 3 meses
  AVG(total_vendas) OVER (
    PARTITION BY vendedor
    ORDER BY mes
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ) AS media_movel_3m
FROM vendas_mensal;
\`\`\`

**Window Functions mais úteis:**
- \`ROW_NUMBER()\` — numeração única
- \`RANK()\` / \`DENSE_RANK()\` — ranking com empates
- \`LAG()\` / \`LEAD()\` — acessar linhas anteriores/posteriores
- \`SUM() OVER()\` — soma acumulada`,
    category: "Dados",
    tags: ["SQL", "PostgreSQL", "Analytics"],
    authorId: "author-9",
    authorName: "Fernanda Lima",
    authorArea: "Dados",
    createdAt: "2026-02-07T13:00:00Z",
    reactions: { "👍": 35, "🔥": 20, "🤯": 15, "💡": 30 },
    comments: [
      { id: "c5", authorName: "Rafael Oliveira", content: "Window functions são essenciais. Uso LEAD/LAG todo dia.", createdAt: "2026-02-07T15:00:00Z" }
    ]
  },
  {
    id: "tip-10",
    title: "Pomodoro + Time Blocking: foco profundo para devs",
    content: `Combine Pomodoro (25min foco + 5min pausa) com Time Blocking para maximizar sua produtividade.

**Minha rotina diária:**

| Horário | Bloco | Atividade |
|---------|-------|-----------|
| 09:00-11:30 | Deep Work | Coding (5 pomodoros) |
| 11:30-12:00 | Admin | Code review, PRs |
| 13:00-14:30 | Deep Work | Feature principal (3 pomodoros) |
| 14:30-15:00 | Social | 1:1s, pair programming |
| 15:00-16:30 | Deep Work | Bugs/refactoring (3 pomodoros) |
| 16:30-17:00 | Planning | Planejar amanhã |

**Ferramentas:**
- Google Calendar com blocos coloridos
- Forest app para não mexer no celular
- Toggl Track para medir tempo real vs planejado

**Regra de ouro:** Proteja seus blocos de Deep Work. Sem Slack, sem email, sem reuniões.`,
    category: "Produtividade",
    tags: ["Foco", "Rotina", "Gestão de Tempo"],
    authorId: "author-10",
    authorName: "Bruno Nascimento",
    authorArea: "Produtividade",
    createdAt: "2026-02-06T08:00:00Z",
    reactions: { "👍": 45, "🔥": 25, "🤯": 3, "💡": 38 },
    comments: []
  },
  {
    id: "tip-11",
    title: "CSS Container Queries: responsive design no nível do componente",
    content: `Container Queries permitem estilizar elementos com base no tamanho do container pai, não da viewport.

\`\`\`css
/* Defina o container */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* Estilos baseados no tamanho do container */
@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 1rem;
  }
}

@container card (max-width: 399px) {
  .card {
    display: flex;
    flex-direction: column;
  }
}
\`\`\`

Isso resolve o problema histórico de componentes que precisam se adaptar ao espaço disponível, não ao tamanho da tela. Suportado em todos os browsers modernos desde 2023.`,
    category: "Dev",
    tags: ["CSS", "Responsive", "Frontend"],
    authorId: "author-2",
    authorName: "Lucas Mendes",
    authorArea: "Design",
    createdAt: "2026-02-05T16:00:00Z",
    reactions: { "👍": 20, "🔥": 14, "🤯": 18, "💡": 10 },
    comments: []
  },
  {
    id: "tip-12",
    title: "Kubernetes: liveness vs readiness probes",
    content: `Entender a diferença entre probes evita downtime e restarts desnecessários.

\`\`\`yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: api
    image: minha-api:latest
    
    # Readiness: "estou pronto para receber tráfego?"
    readinessProbe:
      httpGet:
        path: /health/ready
        port: 3000
      initialDelaySeconds: 5
      periodSeconds: 10
    
    # Liveness: "ainda estou funcionando?"
    livenessProbe:
      httpGet:
        path: /health/live
        port: 3000
      initialDelaySeconds: 15
      periodSeconds: 20
      failureThreshold: 3
    
    # Startup: "já terminei de inicializar?"
    startupProbe:
      httpGet:
        path: /health/startup
        port: 3000
      failureThreshold: 30
      periodSeconds: 10
\`\`\`

**Regra:** Readiness para controlar tráfego, Liveness para detectar deadlocks, Startup para apps lentos de inicializar.`,
    category: "DevOps",
    tags: ["Kubernetes", "Monitoramento", "SRE"],
    authorId: "author-3",
    authorName: "Ana Costa",
    authorArea: "DevOps",
    createdAt: "2026-02-04T11:00:00Z",
    reactions: { "👍": 32, "🔥": 20, "🤯": 7, "💡": 18 },
    comments: [
      { id: "c6", authorName: "Diego Almeida", content: "Startup probe é essencial para apps Java/Spring Boot.", createdAt: "2026-02-04T14:00:00Z" }
    ]
  }
]
