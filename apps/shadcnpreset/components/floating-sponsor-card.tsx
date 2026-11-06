"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { BadgeCheckIcon, XIcon } from "lucide-react"

import { SPONSORS, type Sponsor } from "@/components/sponsors"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/analytics-events"
import { useSponsorImpression } from "@/lib/use-sponsor-impression"
import { cn } from "@/lib/utils"

/**
 * Below this width the card would cover too much of the page, so it does not
 * float. Learn articles show their inline card instead, hidden from the same
 * width with `min-[1360px]:hidden`.
 */
const FLOATING_MEDIA = "(min-width: 1360px)"

/** Pages that are not visited directly: preset previews load inside iframes. */
const EXCLUDED_PREFIXES = ["/preset-preview"]

/**
 * The floating sponsor card for whichever page is open. Each page is a fresh
 * impression, and the placement names the page's section (`floating-home`,
 * `floating-preset`, …) so the affiliate dashboard reports where it sold.
 */
export function SiteFloatingSponsorCard() {
  const pathname = usePathname()

  if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null
  }

  return (
    <FloatingSponsorCard
      key={pathname}
      sponsor={SPONSORS[0]}
      placement={`floating-${pathname.split("/")[1] || "home"}`}
    />
  )
}

/** Pages the reader does not scroll, like the app-like ones, open after this. */
const OPEN_AFTER_MS = 5000

/** The card's distance from the bottom of the screen, and from the footer. */
const EDGE_GAP = 16

/** The card's height with a two-line tagline, rounded up. */
const MAX_CARD_HEIGHT = 96

/**
 * A small sponsor card fixed to the bottom-right corner. It opens once the
 * reader scrolls a screen down or has spent a few seconds on the page, rises
 * to sit above the site footer rather than cover it, and stays closed for this
 * sponsor once dismissed.
 *
 * Give it a `key` per page: a new page is a new impression.
 */
export function FloatingSponsorCard({
  sponsor,
  placement,
}: {
  sponsor: Sponsor
  placement: string
}) {
  const { partner, Logo } = sponsor
  const dismissed = useDismissed(partner)
  const wide = useMediaQuery(FLOATING_MEDIA)
  const ready = useReadyToOpen()
  const bottom = useBottomAboveFooter()

  const open = dismissed === false && wide && ready

  useSponsorImpression(open, partner, placement)

  if (dismissed !== false || !wide) {
    return null
  }

  return (
    <aside
      aria-label="Sponsored"
      data-state={open ? "open" : "closed"}
      // Mounted closed so it can slide in; inert keeps the hidden link and
      // button out of the tab order until then.
      inert={!open}
      // Follows the footer as it scrolls, so `bottom` is not transitioned.
      style={{ bottom }}
      className={cn(
        "fixed right-4 z-40 w-72 transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none",
        open
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      )}
    >
      <a
        href={sponsor.href(placement)}
        target="_blank"
        // Search engines expect paid links marked sponsored.
        rel="sponsored noopener"
        className="flex items-start gap-3 rounded-xl border bg-popover p-3 pr-16 text-popover-foreground shadow-lg transition-colors hover:bg-muted"
        onClick={() => {
          trackEvent("affiliate_click", { partner, placement })
        }}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-foreground text-background">
          <Logo className="size-5" />
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="flex items-center gap-1 text-sm font-medium">
            {sponsor.name}
            {sponsor.verified ? (
              // A filled badge with the check cut out of it: the outline and
              // check are drawn in the card's own colour.
              <BadgeCheckIcon
                aria-hidden
                className="size-4 shrink-0 fill-muted-foreground text-popover"
              />
            ) : null}
          </span>
          <span className="text-xs text-muted-foreground">
            {sponsor.tagline}
          </span>
        </span>
      </a>
      {/* Outside the link, so closing the card is never counted as a click. */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <Badge
          variant="outline"
          className="pointer-events-none text-[10px] text-muted-foreground"
        >
          Ad
        </Badge>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Hide ad"
          className="text-muted-foreground"
          onClick={() => {
            dismiss(partner)
            trackEvent("affiliate_dismiss", { partner, placement })
          }}
        >
          <XIcon />
        </Button>
      </div>
    </aside>
  )
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [query])

  return matches
}

/**
 * True once the reader has scrolled a screen height, or has had the page open
 * and visible for `OPEN_AFTER_MS` — app-like pages scroll inside their own
 * panels, and short pages never scroll a full screen. It stays true for the
 * page: scrolling back to the top does not take the card away again.
 */
function useReadyToOpen() {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    if (ready) return
    const onScroll = () => {
      if (window.scrollY >= window.innerHeight) setReady(true)
    }
    // A background tab is not looking, so its timer waits for the page to
    // be shown again.
    const onTimer = () => {
      if (document.visibilityState === "visible") setReady(true)
      else document.addEventListener("visibilitychange", onTimer)
    }
    const timer = window.setTimeout(onTimer, OPEN_AFTER_MS)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("visibilitychange", onTimer)
    }
  }, [ready])

  return ready
}

/**
 * The card's `bottom` offset: the usual gap from the screen edge, raised to
 * clear the site footer (the page's last `<footer>`) while it is on screen.
 */
function useBottomAboveFooter() {
  const [bottom, setBottom] = React.useState(EDGE_GAP)

  React.useEffect(() => {
    const footer = Array.from(document.querySelectorAll("footer")).at(-1)
    if (!footer) return
    const update = () => {
      const { innerHeight } = window
      const footerShown = innerHeight - footer.getBoundingClientRect().top
      // Short screens: stop rising before the card would leave the top.
      const highest = innerHeight - MAX_CARD_HEIGHT - EDGE_GAP * 2
      setBottom(Math.min(Math.max(footerShown, 0), highest) + EDGE_GAP)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  return bottom
}

function dismissedKey(partner: string) {
  return `sponsor-card-dismissed:${partner}`
}

/** Partners closed on this page, for when storage is blocked. */
const dismissedHere = new Set<string>()
const dismissListeners = new Set<() => void>()

function subscribeDismissed(listener: () => void) {
  dismissListeners.add(listener)
  // Closing it in another tab closes it here too.
  window.addEventListener("storage", listener)
  return () => {
    dismissListeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

/** Whether the card was closed for this sponsor; null until on the client. */
function useDismissed(partner: string): boolean | null {
  return React.useSyncExternalStore(
    subscribeDismissed,
    () => readDismissed(partner),
    // Unknown on the server, so a closed card never flashes on load.
    () => null
  )
}

function readDismissed(partner: string): boolean {
  if (dismissedHere.has(partner)) return true
  try {
    return window.localStorage.getItem(dismissedKey(partner)) !== null
  } catch {
    return false
  }
}

function dismiss(partner: string) {
  try {
    window.localStorage.setItem(dismissedKey(partner), "1")
  } catch {
    // Blocked storage: the card still closes, until the next full load.
    dismissedHere.add(partner)
  }
  dismissListeners.forEach((listener) => listener())
}
