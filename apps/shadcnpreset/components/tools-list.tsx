"use client"

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import {
  ToolCard,
  ToolCardDescription,
  ToolCardHeader,
  ToolCardTitle,
} from "@/components/tool-card"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

type ToolListItem = {
  href: string
  title: string
  description: string
  date?: string
  updated?: string
  badge?: string
}

function formatDate(date: string) {
  return format(parseISO(date), "dd MMM yyyy")
}

export function ToolsList({ tools }: { tools: readonly ToolListItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard
          key={tool.href}
          render={<Link href={tool.href} />}
          className={cn("row-span-2 grid grid-rows-subgrid gap-2", {
            "row-span-3": tool.date,
          })}
        >
          <ToolCardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <ToolCardTitle>{tool.title}</ToolCardTitle>
              {tool.badge ? (
                <Badge variant="default">{tool.badge}</Badge>
              ) : null}
            </div>
          </ToolCardHeader>
          <ToolCardDescription>{tool.description}</ToolCardDescription>
          {tool.date ? (
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
          ) : null}
        </ToolCard>
      ))}
    </div>
  )
}
