"use client"
import Link from "next/link"

import { siteConfig } from "@/lib/config"
import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"

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
