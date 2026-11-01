"use client"

import { buttonVariants } from "@/components/ui/button"
import { trackEvent } from "@/lib/analytics-events"
import { cn } from "@/lib/utils"

/** Where "Go Pro" leads: a hosted checkout, set with the free limit. */
const CHECKOUT_URL = process.env.NEXT_PUBLIC_PRO_CHECKOUT_URL

const PRICE = "£8 a month"

/**
 * In the composer's place once the free answers are used. What someone has
 * made stays theirs; only new answers need Pro.
 */
export function ProWall({ className }: { className?: string }) {
  return (
    <aside
      aria-label="Pro"
      className={cn(
        "mx-auto flex w-full max-w-4xl flex-wrap items-center gap-5 p-4",
        className
      )}
    >
      <div className="flex min-w-0 flex-[1_1_26rem] flex-col gap-1.5 rounded-xl border p-4">
        <p className="font-medium">You’ve used your free generations</p>
        <p className="text-sm text-balance text-muted-foreground">
          Everything you’ve made stays yours to edit and install. Pro keeps the
          assistant going: unlimited generations, and custom presets from a
          pasted stylesheet, a design doc or your website.
        </p>
        {CHECKOUT_URL ? (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={CHECKOUT_URL}
              className={buttonVariants()}
              onClick={() => trackEvent("pro_checkout_click", {})}
            >
              Go Pro, {PRICE}
            </a>
            <span className="text-xs text-muted-foreground">
              Cancel anytime
            </span>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
