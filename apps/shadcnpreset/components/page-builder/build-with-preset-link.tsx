"use client"

import { HammerIcon } from "@phosphor-icons/react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { trackEvent } from "@/lib/analytics-events"
import { cn } from "@/lib/utils"

/**
 * Sends someone looking at a preset's blocks to the page builder, already
 * dressed in that preset. The builder is where "Get the code" lives, so each
 * way in reports its click: `placement` says where the link sat, e.g.
 * `marketing-preview`.
 */
export function BuildWithPresetLink({
  presetCode,
  placement,
  className,
}: {
  presetCode: string
  placement: string
  className?: string
}) {
  return (
    <Link
      href={`/build?preset=${presetCode}`}
      className={cn(
        buttonVariants({ size: "lg" }),
        "rounded-full shadow-lg",
        className
      )}
      onClick={() => {
        trackEvent("build_link_click", {
          placement,
          preset_code: presetCode,
        })
      }}
    >
      <HammerIcon />
      Build a page with these blocks
    </Link>
  )
}
