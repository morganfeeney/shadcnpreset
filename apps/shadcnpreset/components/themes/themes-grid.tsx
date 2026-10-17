"use client"

import Link from "next/link"

import {
  ThemeFilters,
  useThemeFilter,
  type ThemeNavItem,
} from "@/components/themes/theme-nav"
import {
  ThemeSurface,
  useRegistryTheme,
  useSurfaceMode,
} from "@/components/themes/theme-surface"

function ThemeTilePreview({ code }: { code: string }) {
  const registryTheme = useRegistryTheme(code)
  const mode = useSurfaceMode()

  if (!mode || !registryTheme) {
    return <div aria-hidden className="h-[7.5rem] animate-pulse bg-muted" />
  }

  return (
    <ThemeSurface
      registryTheme={registryTheme}
      mode={mode}
      className="grid gap-3 bg-background p-4 text-foreground"
    >
      <span
        aria-hidden
        className="flex h-11 overflow-hidden rounded-lg ring-1 ring-border"
      >
        <span className="flex-2 bg-primary" />
        <span className="flex-1 bg-secondary" />
        <span className="flex-1 bg-muted" />
        <span className="flex-1 bg-chart-2" />
        <span className="flex-1 bg-chart-4" />
      </span>
      <span aria-hidden className="flex gap-1.5 text-xs font-medium">
        <span className="rounded-md bg-primary px-2.5 py-1 text-primary-foreground">
          Button
        </span>
        <span className="rounded-md bg-secondary px-2.5 py-1 text-secondary-foreground">
          Secondary
        </span>
        <span className="rounded-md border px-2.5 py-1">Outline</span>
      </span>
    </ThemeSurface>
  )
}

/** Filterable grid of theme tiles for /themes. */
export function ThemesGrid({ items }: { items: ThemeNavItem[] }) {
  const filter = useThemeFilter(items)

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ThemeFilters filter={filter} className="w-full max-w-md" />
        <span className="text-sm text-muted-foreground">
          {filter.filtered.length} of {items.length} themes
        </span>
      </div>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4">
        {filter.filtered.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/themes/${item.slug}`}
              className="grid overflow-hidden rounded-xl border transition-colors hover:border-foreground/30"
            >
              <ThemeTilePreview code={item.code} />
              <span className="grid gap-0.5 border-t px-4 py-3">
                <span className="font-semibold">{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  {item.details}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {filter.filtered.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">No themes match.</p>
      ) : null}
    </div>
  )
}
