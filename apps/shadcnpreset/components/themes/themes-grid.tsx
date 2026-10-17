"use client"

import Link from "next/link"

import { BezierCurveIcon, ChartDonutIcon } from "@phosphor-icons/react/ssr"

import {
  ThemeFilters,
  ThemeSwatch,
  useThemeFilter,
} from "@/components/themes/theme-nav"
import type { PresetThemeSummary } from "@/lib/preset-themes"

/** A theme's swatch, name, corners and charts, linking to its page. */
export function ThemeTile({ theme }: { theme: PresetThemeSummary }) {
  return (
    <Link
      href={`/themes/${theme.slug}`}
      className="grid h-full content-start gap-3 rounded-none bg-muted px-4.5 py-4 transition-colors hover:bg-muted/70 dark:bg-card dark:hover:bg-muted"
    >
      <span className="flex items-center gap-3">
        <ThemeSwatch code={theme.code} />
        <span className="truncate font-display">{theme.name}</span>
      </span>
      <span className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <BezierCurveIcon aria-hidden className="size-3.5" />
          {theme.meta.corners}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ChartDonutIcon aria-hidden className="size-3.5" />
          {theme.meta.charts}
        </span>
      </span>
    </Link>
  )
}

/** Filterable grid of theme tiles for /themes. */
export function ThemesGrid({ items }: { items: PresetThemeSummary[] }) {
  const filter = useThemeFilter(items)

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ThemeFilters filter={filter} className="w-full max-w-md" />
        <span className="text-sm text-muted-foreground">
          {filter.filtered.length} of {items.length} themes
        </span>
      </div>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-3">
        {filter.filtered.map((item) => (
          <li key={item.slug}>
            <ThemeTile theme={item} />
          </li>
        ))}
      </ul>
      {filter.filtered.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">No themes match.</p>
      ) : null}
    </div>
  )
}
