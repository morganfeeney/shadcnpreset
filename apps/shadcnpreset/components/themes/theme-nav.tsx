"use client"

import * as React from "react"
import Link from "next/link"
import { CaretUpDownIcon } from "@phosphor-icons/react"

import {
  useRegistryTheme,
  useSurfaceMode,
} from "@/components/themes/theme-surface"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { trackEvent } from "@/lib/analytics-events"
import type { PresetThemeSummary } from "@/lib/preset-themes"
import { cn } from "@/lib/utils"

const SWATCH_TOKENS = ["primary", "secondary", "chart-1", "chart-3"] as const

/**
 * A 2×2 palette (primary, secondary, two chart colors) in the site's current
 * mode, cornered with the theme's own radius so square and rounded themes
 * read differently.
 */
export function ThemeSwatch({ code }: { code: string }) {
  const registryTheme = useRegistryTheme(code)
  const mode = useSurfaceMode()
  const vars =
    mode && registryTheme
      ? (registryTheme.cssVars[mode] as Record<string, string>)
      : null
  const radius = (
    registryTheme?.cssVars.light as Record<string, string> | undefined
  )?.radius

  return (
    <span
      aria-hidden
      className="grid size-7 shrink-0 grid-cols-2 overflow-hidden bg-muted ring-1 ring-foreground/10"
      style={{
        // A bare `0` stays a number inside calc(), which is not a length.
        borderRadius:
          !radius || radius === "0" ? radius : `calc(${radius} * 0.6)`,
      }}
    >
      {vars
        ? SWATCH_TOKENS.map((token) => (
            <span key={token} style={{ background: vars[token] }} />
          ))
        : null}
    </span>
  )
}

/** How long typing pauses before a search counts as one search. */
const SEARCH_TRACK_DELAY = 1000

/**
 * Search and base-color filter state shared by the theme lists. A search is
 * reported once typing pauses, and again only when the search changes.
 */
export function useThemeFilter<T extends { name: string; baseColor: string }>(
  items: T[],
  placement: "listing" | "sidebar"
) {
  const [query, setQuery] = React.useState("")
  const [baseColor, setBaseColor] = React.useState("all")
  const baseColors = React.useMemo(
    () => [...new Set(items.map((item) => item.baseColor))].sort(),
    [items]
  )
  const needle = query.trim().toLowerCase()
  const filtered = items.filter(
    (item) =>
      (baseColor === "all" || item.baseColor === baseColor) &&
      (!needle || item.name.toLowerCase().includes(needle))
  )

  const resultCount = filtered.length
  const lastTracked = React.useRef("")
  React.useEffect(() => {
    // Clearing the search means the same search typed again is a new one.
    if (!needle && baseColor === "all") {
      lastTracked.current = ""
      return
    }
    const search = `${needle}|${baseColor}`
    if (search === lastTracked.current) return
    const timeout = setTimeout(() => {
      lastTracked.current = search
      trackEvent("theme_search", {
        placement,
        search_term: needle || undefined,
        base_color: baseColor === "all" ? undefined : baseColor,
        result_count: resultCount,
      })
    }, SEARCH_TRACK_DELAY)
    return () => clearTimeout(timeout)
  }, [needle, baseColor, placement, resultCount])

  return { query, setQuery, baseColor, setBaseColor, baseColors, filtered }
}

export function ThemeFilters({
  filter,
  className,
}: {
  filter: ReturnType<typeof useThemeFilter>
  className?: string
}) {
  return (
    <div className={cn("flex gap-2", className)}>
      <input
        type="search"
        aria-label="Search themes"
        placeholder="Search themes"
        value={filter.query}
        onChange={(event) => filter.setQuery(event.target.value)}
        className="h-8 min-w-0 flex-1 rounded-md border bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
      />
      <select
        aria-label="Base color"
        value={filter.baseColor}
        onChange={(event) => filter.setBaseColor(event.target.value)}
        className="h-8 rounded-md border bg-background px-2 text-sm capitalize outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <option value="all">All bases</option>
        {filter.baseColors.map((baseColor) => (
          <option key={baseColor} value={baseColor}>
            {baseColor}
          </option>
        ))}
      </select>
    </div>
  )
}

/** Searchable list of themes linking to their pages. */
export function ThemeSidebar({
  items,
  currentSlug,
  onNavigate,
}: {
  items: PresetThemeSummary[]
  currentSlug: string
  onNavigate?: () => void
}) {
  const filter = useThemeFilter(items, "sidebar")

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="flex items-baseline justify-between px-1">
        <Link href="/themes" className="text-sm font-semibold hover:underline">
          shadcn themes
        </Link>
        <span className="text-xs text-muted-foreground">
          {items.length} themes
        </span>
      </div>
      <ThemeFilters filter={filter} />
      <ul className="flex flex-col gap-0.5">
        {filter.filtered.map((item) => {
          const current = item.slug === currentSlug
          return (
            <li key={item.slug}>
              <Link
                href={`/themes/${item.slug}`}
                // Switching theme keeps your place on the page.
                scroll={false}
                aria-current={current ? "page" : undefined}
                onClick={() => {
                  trackEvent("theme_card_click", {
                    theme_slug: item.slug,
                    placement: "sidebar",
                  })
                  onNavigate?.()
                }}
                className={cn(
                  "flex items-center gap-3 rounded-md border border-transparent p-2 transition-colors hover:bg-muted/60",
                  current && "border-border bg-muted"
                )}
              >
                <ThemeSwatch code={item.code} />
                <span className="grid min-w-0">
                  <span className="truncate text-sm font-medium">
                    {item.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {item.details}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
        {filter.filtered.length === 0 ? (
          <li className="px-2 py-4 text-sm text-muted-foreground">
            No themes match.
          </li>
        ) : null}
      </ul>
    </div>
  )
}

/** Below `lg`: the current theme as a button that opens the theme list. */
export function ThemePicker({
  items,
  currentSlug,
  className,
}: {
  items: PresetThemeSummary[]
  currentSlug: string
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const current = items.find((item) => item.slug === currentSlug)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn("h-auto w-full justify-start gap-3 p-3", className)}
          />
        }
      >
        {current ? <ThemeSwatch code={current.code} /> : null}
        <span className="grid flex-1 text-left">
          <span className="text-sm font-medium">
            {current?.name ?? "Themes"}
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            Change theme · {items.length} themes
          </span>
        </span>
        <CaretUpDownIcon aria-hidden />
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100vw-1rem,20rem)] p-3">
        <SheetHeader className="sr-only">
          <SheetTitle>Themes</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 overflow-y-auto">
          <ThemeSidebar
            items={items}
            currentSlug={currentSlug}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
