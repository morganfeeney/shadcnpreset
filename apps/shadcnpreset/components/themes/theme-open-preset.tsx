"use client"

import Link from "next/link"
import { ArrowUpRightIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/analytics-events"

/** Opens the preset a theme comes from, reporting the theme it was opened from. */
export function ThemeOpenPresetButton({
  themeSlug,
  presetCode,
}: {
  themeSlug: string
  presetCode: string
}) {
  return (
    <Button
      variant="outline"
      size="lg"
      nativeButton={false}
      render={<Link href={`/preset/${presetCode}`} />}
      onClick={() =>
        trackEvent("theme_open_preset", {
          theme_slug: themeSlug,
          preset_code: presetCode,
        })
      }
    >
      Open the preset
      <ArrowUpRightIcon aria-hidden />
    </Button>
  )
}
