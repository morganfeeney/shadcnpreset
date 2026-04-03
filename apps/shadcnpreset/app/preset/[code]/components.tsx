"use client"

import { PresetVoteButton } from "@/components/preset-vote-button"
import { Button, buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { FullscreenIcon } from "lucide-react"

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
        className={buttonVariants({})}
      >
        Open full size
        <FullscreenIcon className="size-3.5" aria-hidden />
      </Link>
    </>
  )
}
