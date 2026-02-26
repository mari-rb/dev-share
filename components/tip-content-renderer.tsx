"use client"

import { CodeBlock } from "./code-block"

interface TipContentRendererProps {
  content: string
}

export function TipContentRenderer({ content }: TipContentRendererProps) {
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="text-sm leading-relaxed text-foreground/85">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const inner = part.slice(3, -3)
          const firstNewline = inner.indexOf("\n")
          const language = firstNewline > 0 ? inner.slice(0, firstNewline).trim() : ""
          const code = firstNewline > 0 ? inner.slice(firstNewline + 1) : inner
          return <CodeBlock key={index} code={code} language={language} />
        }

        return (
          <div key={index} className="whitespace-pre-wrap">
            {part.split("\n").map((line, i) => {
              if (line.startsWith("# ")) {
                return (
                  <h2 key={i} className="mb-2 mt-4 text-lg font-semibold text-foreground">
                    {line.slice(2)}
                  </h2>
                )
              }
              if (line.startsWith("## ")) {
                return (
                  <h3 key={i} className="mb-2 mt-3 text-base font-semibold text-foreground">
                    {line.slice(3)}
                  </h3>
                )
              }
              if (line.startsWith("**") && line.endsWith("**")) {
                return (
                  <p key={i} className="mb-1 mt-3 font-semibold text-foreground">
                    {line.slice(2, -2)}
                  </p>
                )
              }
              if (line.startsWith("- ")) {
                return (
                  <li key={i} className="ml-4 list-disc text-foreground/85">
                    {line.slice(2)}
                  </li>
                )
              }
              if (line.startsWith("| ")) {
                return (
                  <p key={i} className="font-mono text-xs text-foreground/70">
                    {line}
                  </p>
                )
              }
              if (line.trim() === "") {
                return <br key={i} />
              }
              return <span key={i}>{line}{"\n"}</span>
            })}
          </div>
        )
      })}
    </div>
  )
}
