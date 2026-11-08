"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { BadgeCheckIcon } from "lucide-react"

import { SPONSORS, type Sponsor } from "@/components/sponsors"
import { Badge } from "@/components/ui/badge"
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
 * reader scrolls a screen down or has spent a few seconds on the page, and
 * stays: it can't be closed. So it never covers what the page is for, it
 * rises above the site footer and a workspace's bar, and sits left of a
 * workspace's right-hand panel.
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
  const wide = useMediaQuery(FLOATING_MEDIA)
  const ready = useReadyToOpen()
  const { bottom, right } = usePlacement()

  const open = wide && ready

  useSponsorImpression(open, partner, placement)

  if (!wide) {
    return null
  }

  return (
    <aside
      aria-label="Sponsored"
      data-state={open ? "open" : "closed"}
      // Mounted closed so it can slide in; inert keeps the hidden link out of
      // the tab order until then.
      inert={!open}
      // Follows the footer as it scrolls, so its place is not transitioned.
      style={{ bottom, right }}
      className={cn(
        "fixed z-40 w-72 transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none",
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
        className="flex items-start gap-3 rounded-xl border bg-popover p-3 pr-12 text-popover-foreground shadow-lg transition-colors hover:bg-muted"
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
      <Badge
        variant="outline"
        className="pointer-events-none absolute top-2 right-2 text-[10px] text-muted-foreground"
      >
        Ad
      </Badge>
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
 * Where the card sits: the usual gap from the screen's bottom-right corner,
 * raised to clear the site footer (the page's last `<footer>` showing) while
 * it is on screen and a workspace's bar, and moved left of a workspace's right-hand
 * panel. Measured again as the page scrolls, resizes or a panel opens.
 */
function usePlacement() {
  const [place, setPlace] = React.useState({
    bottom: EDGE_GAP,
    right: EDGE_GAP,
  })

  React.useEffect(() => {
    let frame = 0
    // A panel's width moving as it opens, where there is one to watch.
    const resized =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => schedule())
    const measure = () => {
      frame = 0
      const { innerHeight, innerWidth } = window
      // Short screens: stop rising before the card would leave the top.
      const highest = innerHeight - MAX_CARD_HEIGHT - EDGE_GAP * 2

      // The last footer showing: a page Next keeps hidden after leaving it
      // (its own footers, say a workspace's bar) measures as nothing.
      let raise = 0
      const footer = Array.from(document.querySelectorAll("footer"))
        .map((element) => element.getBoundingClientRect())
        .filter(({ height }) => height > 0)
        .at(-1)
      if (footer) raise = innerHeight - footer.top
      for (const bar of document.querySelectorAll<HTMLElement>(
        '[data-slot="workspace-bar"]'
      )) {
        resized?.observe(bar)
        const { top, height } = bar.getBoundingClientRect()
        if (height) raise = Math.max(raise, innerHeight - top)
      }

      let shift = 0
      for (const panel of document.querySelectorAll<HTMLElement>(
        '[data-slot="workspace-panel"][data-side="end"]'
      )) {
        resized?.observe(panel)
        const { left, width } = panel.getBoundingClientRect()
        if (width) shift = Math.max(shift, innerWidth - left)
      }

      const next = {
        bottom: Math.min(Math.max(raise, 0), highest) + EDGE_GAP,
        right: shift + EDGE_GAP,
      }
      setPlace((current) =>
        current.bottom === next.bottom && current.right === next.right
          ? current
          : next
      )
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    // A panel opening or closing, or the page's workspace arriving after
    // the card has.
    const changed = new MutationObserver(schedule)
    changed.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-state", "hidden"],
    })
    measure()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      resized?.disconnect()
      changed.disconnect()
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [])

  return place
}
