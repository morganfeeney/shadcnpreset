"use client"

import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/analytics-events"
import { PRO_CHECKOUT_URL } from "@/lib/pro"
import { cn } from "@/lib/utils"

const LINK = "font-medium text-primary underline-offset-4 hover:underline"

function checkoutClick() {
  trackEvent("pro_checkout_click", { from: "custom_preset_limit" })
}

/**
 * Rises above the composer when someone asks for a custom preset past the
 * free cap. Only making one is held back; the chat carries on beneath it.
 */
export function CustomPresetLimitNote({
  onDismiss,
  className,
}: {
  onDismiss: () => void
  className?: string
}) {
  return (
    <aside
      role="status"
      aria-label="Custom preset limit"
      className={cn(
        // Inset from the input's edges and resting on its top border. Sized
        // by its own width, so it reads the same beside the panel or on a
        // phone as in a wide chat.
        "@container/limit mx-3 flex animate-in items-center gap-2 rounded-t-lg border border-b-0 bg-muted py-1.5 pr-1.5 pl-3 text-xs duration-300 fade-in-0 slide-in-from-bottom-2",
        className
      )}
    >
      <p className="min-w-0 flex-1 text-muted-foreground">
        Upgrade to{" "}
        {PRO_CHECKOUT_URL ? (
          <a href={PRO_CHECKOUT_URL} className={LINK} onClick={checkoutClick}>
            Pro
          </a>
        ) : (
          "Pro"
        )}{" "}
        to unlock unlimited custom presets.
      </p>
      {PRO_CHECKOUT_URL ? (
        <a
          href={PRO_CHECKOUT_URL}
          // In a narrow column "Pro" above is the way in, leaving room to read.
          className={cn(LINK, "hidden shrink-0 @sm/limit:inline")}
          onClick={checkoutClick}
        >
          Upgrade
        </a>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label="Dismiss"
        onClick={onDismiss}
      >
        <XIcon />
      </Button>
    </aside>
  )
}
