"use client"

import * as React from "react"
import Link from "next/link"

import { siteConfig } from "@/lib/config"
import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

function formatStars(count: number | undefined) {
  if (count == null || Number.isNaN(count)) return null
  if (count >= 1000) return `${Math.round(count / 1000)}k`
  return count.toLocaleString()
}

function StarsCount() {
  const [formatted, setFormatted] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(
          "https://api.github.com/repos/morganfeeney/shadcnpreset"
        )
        const json = (await res.json()) as { stargazers_count?: number }
        if (!cancelled) {
          setFormatted(formatStars(json.stargazers_count) ?? null)
        }
      } catch {
        if (!cancelled) setFormatted(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (formatted == null) {
    return <Skeleton className="h-4 w-3" />
  }

  return (
    <span className="w-fit text-xs text-muted-foreground tabular-nums">
      {formatted}
    </span>
  )
}

export function GitHubLink() {
  return (
    <Link
      className={buttonVariants({
        size: "sm",
        variant: "ghost",
        className: "h-8 shadow-none",
      })}
      href={siteConfig.links.github}
      target="_blank"
      rel="noreferrer"
    >
      <Icons.gitHub />
      {/*<StarsCount />*/}
    </Link>
  )
}
