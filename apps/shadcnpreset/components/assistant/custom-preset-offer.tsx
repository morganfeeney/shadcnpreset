"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/analytics-events"
import type { BrandColour } from "@/lib/brand-theme"
import { cn } from "@/lib/utils"

/**
 * Offered under an answer to someone who gave exact colours, which no preset
 * code can hold: a custom preset puts them on the preset the assistant
 * picked. Making one saves it and opens it beside the chat, free; the card
 * then reopens that one rather than making another.
 *
 * Counts a view per chat and set of colours, as the sponsored card counts its
 * impressions, so the makes read against it.
 */
export function CustomPresetOffer({
  text,
  colours,
  presetCode,
  chatId,
  openId,
  onOpen,
  onLimit,
  className,
}: {
  /** The message the colours came in; the server reads them from it. */
  text: string
  colours: BrandColour[]
  presetCode: string
  chatId: string | null
  /** The custom preset open beside the chat, if any. */
  openId: string | null
  onOpen: (id: string) => void
  /** Making one went past the cap an account keeps. */
  onLimit: (limit: number) => void
  className?: string
}) {
  const [making, setMaking] = React.useState(false)
  // One open on arrival (a reload, a link) is this card's.
  const [madeId, setMadeId] = React.useState(openId)
  const isOpen = Boolean(madeId) && madeId === openId
  const colourKey = colours.map(({ colour }) => colour).join(",")

  React.useEffect(() => {
    trackEvent("custom_preset_offer_view", {
      colour_count: colourKey.split(",").length,
    })
  }, [colourKey, chatId])

  async function make() {
    if (madeId) {
      onOpen(madeId)
      return
    }
    setMaking(true)
    trackEvent("custom_preset_offer_click", { preset_code: presetCode })
    const response = await fetch("/api/custom-presets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presetCode, text, chatId }),
    }).catch(() => null)
    const body = response
      ? ((await response.json().catch(() => null)) as {
          id?: string
          code?: string
          limit?: number
        } | null)
      : null
    setMaking(false)
    if (body?.code === "custom_preset_limit") {
      onLimit(body.limit ?? 0)
      return
    }
    if (!response?.ok || !body?.id) {
      toast.error("That didn’t go through. Try again in a moment.")
      return
    }
    setMadeId(body.id)
    onOpen(body.id)
  }

  const title =
    colours.length === 1
      ? `Make a custom preset with ${colours[0].colour}`
      : "Make a custom preset in your colours"

  return (
    <aside aria-label="Custom preset" className={className}>
      <div
        className={cn(
          "flex flex-col gap-4 rounded-lg border p-4 transition-colors sm:flex-row",
          isOpen && "border-primary"
        )}
      >
        <ul aria-label="Your colours" className="flex shrink-0 gap-1.5">
          {colours.map(({ colour }) => (
            <li key={colour} title={colour}>
              <span
                className="relative block size-10 rounded-md border"
                style={{ background: colour }}
              >
                <span className="sr-only">{colour}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="-mt-1 flex min-w-0 flex-1 flex-col gap-1">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="text-xs text-balance text-muted-foreground">
            Presets use a fixed colour palette, so they can&#39;t match your
            exact colours. Create a custom preset to see your colours in action
            and get the code.
          </p>
        </div>
        <Button
          type="button"
          variant={isOpen ? "secondary" : "default"}
          className="shrink-0"
          disabled={making}
          onClick={() => void make()}
        >
          {making
            ? "Opening…"
            : isOpen
              ? "Open on the right"
              : "Use my colours"}
        </Button>
      </div>
    </aside>
  )
}
