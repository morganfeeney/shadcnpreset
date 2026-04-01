import * as React from "react"
import Link from "next/link"

import { siteConfig } from "@/lib/config"
import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

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
      <React.Suspense fallback={<Skeleton className="h-4 w-[42px]" />}>
        <StarsCount />
      </React.Suspense>
    </Link>
  )
}

export async function StarsCount() {
  const data = await fetch(
    "https://api.github.com/repos/morganfeeney/shadcnpreset",
    {
      next: { revalidate: 86400 },
    }
  )
  const json = await data.json()

  const formattedCount =
    json.stargazers_count >= 1000
      ? `${Math.round(json.stargazers_count / 1000)}k`
      : json.stargazers_count?.toLocaleString()

  return (
    <span className="w-fit text-xs text-muted-foreground tabular-nums">
      {formattedCount}
    </span>
  )
}
