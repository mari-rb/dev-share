export type Category = "Dev" | "Design" | "DevOps" | "Dados" | "Produtividade"

export interface UserProfile {
  id: string
  name: string
  bio: string
  area: Category
  tools: string[]
}

export interface Tip {
  id: string
  title: string
  content: string
  category: Category
  tags: string[]
  authorId: string
  authorName: string
  authorArea: Category
  createdAt: string
  reactions: Record<string, number>
  comments: Comment[]
}

export interface Comment {
  id: string
  authorName: string
  content: string
  createdAt: string
}

export const CATEGORIES: Category[] = ["Dev", "Design", "DevOps", "Dados", "Produtividade"]

export const ALL_TOOLS = [
  "React", "Next.js", "TypeScript", "Node.js", "Python",
  "Figma", "Tailwind CSS", "Docker", "Kubernetes", "AWS",
  "PostgreSQL", "MongoDB", "Redis", "Git", "VS Code",
  "GraphQL", "Prisma", "Terraform", "CI/CD", "Notion",
  "Linear", "Slack", "Jira", "Obsidian", "Vim"
]

export const REACTION_EMOJIS = ["👍", "🔥", "🤯", "💡"] as const
