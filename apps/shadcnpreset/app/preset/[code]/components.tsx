"use client"

import { PresetVoteButton } from "@/components/preset-vote-button"
import { Button, buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { Share2 } from "lucide-react"

export function PresetButtons({
  preset,
  href,
}: {
  preset: string
  href: string
}) {
  return (
    <>
      <PresetVoteButton code={preset} />
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: "outline" })}
      >
        Share
        <Share2 aria-hidden />
      </Link>
    </>
  )
}
