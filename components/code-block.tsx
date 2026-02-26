"use client"

import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <div className="my-3 overflow-hidden rounded-lg border border-border">
      {language && (
        <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-4 py-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {language}
          </span>
        </div>
      )}
      <pre
        className={cn(
          "overflow-x-auto bg-secondary/30 p-4 text-sm leading-relaxed",
          "font-mono text-foreground/90"
        )}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}
