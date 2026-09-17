"use client"

import Link from "next/link"

import {
  ToolCard,
  ToolCardDescription,
  ToolCardHeader,
  ToolCardTitle,
} from "@/components/tool-card"
import { format, parseISO } from "date-fns"

type ToolListItem = {
  href: string
  title: string
  description: string
  date: string
  updated: string
}

function formatDate(date: string) {
  return format(parseISO(date), "dd MMM yyyy")
}

export function ToolsList({ tools }: { tools: readonly ToolListItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.href} render={<Link href={tool.href} />}>
          <ToolCardHeader>
            <ToolCardTitle>{tool.title}</ToolCardTitle>
            <ToolCardDescription>{tool.description}</ToolCardDescription>
            <p className="mt-2 font-mono text-xs font-medium text-muted-foreground uppercase">
              <time dateTime={tool.date}>{formatDate(tool.date)}</time>
              {tool.updated ? (
                <>
                  {" · Updated "}
                  <time dateTime={tool.updated}>
                    {formatDate(tool.updated)}
                  </time>
                </>
              ) : null}
            </p>
          </ToolCardHeader>
        </ToolCard>
      ))}
    </div>
  )
}
