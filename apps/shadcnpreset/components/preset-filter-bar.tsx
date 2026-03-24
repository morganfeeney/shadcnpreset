"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"

import { CreatePicker } from "@/components/create-picker"
import type { PresetFilters } from "@/lib/preset-catalog"
import { THEMES } from "../../v4/registry/themes"
import { Card } from "../../v4/examples/base/ui/card"

type PresetFilterBarProps = {
  filters: PresetFilters
  pageSize: number
  options: {
    styles: readonly string[]
    baseColors: readonly string[]
    themes: readonly string[]
    chartColors: readonly string[]
    fontHeadings: readonly string[]
    fonts: readonly string[]
    iconLibraries: readonly string[]
    radii: readonly string[]
    menuColors: readonly string[]
    menuAccents: readonly string[]
  }
}

type LocalFilters = {
  style: string
  baseColor: string
  theme: string
  chartColor: string
  fontHeading: string
  font: string
  iconLibrary: string
  radius: string
  menuColor: string
  menuAccent: string
}

function toLocalFilters(filters: PresetFilters): LocalFilters {
  return {
    style: filters.style ?? "all",
    baseColor: filters.baseColor ?? "all",
    theme: filters.theme ?? "all",
    chartColor: filters.chartColor ?? "all",
    fontHeading: filters.fontHeading ?? "all",
    font: filters.font ?? "all",
    iconLibrary: filters.iconLibrary ?? "all",
    radius: filters.radius ?? "all",
    menuColor: filters.menuColor ?? "all",
    menuAccent: filters.menuAccent ?? "all",
  }
}

const V4_BASE_COLORS = new Set([
  "neutral",
  "stone",
  "zinc",
  "mauve",
  "olive",
  "mist",
  "taupe",
])

function getThemeByName(name: string) {
  return THEMES.find((theme) => theme.name === name)
}

export function PresetFilterBar({
  filters,
  pageSize,
  options,
}: PresetFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [localFilters, setLocalFilters] = React.useState<LocalFilters>(
    toLocalFilters(filters)
  )

  React.useEffect(() => {
    setLocalFilters(toLocalFilters(filters))
  }, [filters])

  const themeOptions = React.useMemo(
    () =>
      options.themes.filter(
        (theme) => !options.baseColors.includes(theme as (typeof options.baseColors)[number])
      ),
    [options.baseColors, options.themes]
  )

  const baseColorIndicator = React.useMemo(() => {
    if (localFilters.baseColor === "all") {
      return undefined
    }

    const theme = getThemeByName(localFilters.baseColor)
    return theme?.cssVars?.dark?.["muted-foreground"]
  }, [localFilters.baseColor])

  const themeIndicator = React.useMemo(() => {
    if (localFilters.theme === "all") {
      return undefined
    }

    const theme = getThemeByName(localFilters.theme)
    if (!theme) {
      return undefined
    }

    const key = V4_BASE_COLORS.has(localFilters.theme)
      ? "muted-foreground"
      : "primary"
    return theme.cssVars?.dark?.[key]
  }, [localFilters.theme])

  const chartColorIndicator = React.useMemo(() => {
    if (localFilters.chartColor === "all") {
      return undefined
    }

    const theme = getThemeByName(localFilters.chartColor)
    if (!theme) {
      return undefined
    }

    const key = V4_BASE_COLORS.has(localFilters.chartColor)
      ? "muted-foreground"
      : "primary"
    return theme.cssVars?.dark?.[key]
  }, [localFilters.chartColor])

  function updateFilter<K extends keyof LocalFilters>(
    key: K,
    value: LocalFilters[K]
  ) {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
  }

  function applyFilters() {
    const params = new URLSearchParams()
    params.set("size", String(pageSize))
    params.set("page", "1")
    if (localFilters.style !== "all") params.set("style", localFilters.style)
    if (localFilters.baseColor !== "all")
      params.set("baseColor", localFilters.baseColor)
    if (localFilters.theme !== "all") params.set("theme", localFilters.theme)
    if (localFilters.chartColor !== "all")
      params.set("chartColor", localFilters.chartColor)
    if (localFilters.fontHeading !== "all")
      params.set("fontHeading", localFilters.fontHeading)
    if (localFilters.font !== "all") params.set("font", localFilters.font)
    if (localFilters.iconLibrary !== "all")
      params.set("iconLibrary", localFilters.iconLibrary)
    if (localFilters.radius !== "all") params.set("radius", localFilters.radius)
    if (localFilters.menuColor !== "all")
      params.set("menuColor", localFilters.menuColor)
    if (localFilters.menuAccent !== "all")
      params.set("menuAccent", localFilters.menuAccent)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Card>
      <div className="preset-customizer-menu">
        <span>Menu</span>
        <span className="preset-customizer-menu-icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 6H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M9 10H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </div>
      <div className="preset-filters">
        <CreatePicker
          label="Style"
          indicator={<span className="indicator-square" />}
          onValueChange={(value) => updateFilter("style", value)}
          options={["all", ...options.styles]}
          value={localFilters.style}
        />
        <CreatePicker
          label="Base Color"
          indicator={
            <span
              className="indicator-dot indicator-color"
              style={
                baseColorIndicator
                  ? ({ "--indicator-color": baseColorIndicator } as React.CSSProperties)
                  : undefined
              }
            />
          }
          onValueChange={(value) => updateFilter("baseColor", value)}
          options={["all", ...options.baseColors]}
          value={localFilters.baseColor}
        />
        <CreatePicker
          label="Theme"
          indicator={
            <span
              className="indicator-dot indicator-color"
              style={
                themeIndicator
                  ? ({ "--indicator-color": themeIndicator } as React.CSSProperties)
                  : undefined
              }
            />
          }
          onValueChange={(value) => updateFilter("theme", value)}
          options={["all", ...themeOptions]}
          value={localFilters.theme}
        />
        <CreatePicker
          label="Chart Color"
          indicator={
            <span
              className="indicator-dot indicator-color"
              style={
                chartColorIndicator
                  ? ({ "--indicator-color": chartColorIndicator } as React.CSSProperties)
                  : undefined
              }
            />
          }
          onValueChange={(value) => updateFilter("chartColor", value)}
          options={["all", ...options.chartColors]}
          value={localFilters.chartColor}
        />
        <CreatePicker
          label="Heading"
          indicator={<span className="indicator-aa">Aa</span>}
          onValueChange={(value) => updateFilter("fontHeading", value)}
          options={["all", ...options.fontHeadings]}
          value={localFilters.fontHeading}
        />
        <CreatePicker
          label="Font"
          indicator={<span className="indicator-aa">Aa</span>}
          onValueChange={(value) => updateFilter("font", value)}
          options={["all", ...options.fonts]}
          value={localFilters.font}
        />
        <CreatePicker
          label="Icon Library"
          indicator={<span className="indicator-swirl">◌</span>}
          onValueChange={(value) => updateFilter("iconLibrary", value)}
          options={["all", ...options.iconLibraries]}
          value={localFilters.iconLibrary}
        />
        <CreatePicker
          label="Radius"
          indicator={<span className="indicator-corner" />}
          onValueChange={(value) => updateFilter("radius", value)}
          options={["all", ...options.radii]}
          value={localFilters.radius}
        />
        <CreatePicker
          label="Menu"
          indicator={<span className="indicator-menu">☰</span>}
          onValueChange={(value) => updateFilter("menuColor", value)}
          options={["all", ...options.menuColors]}
          value={localFilters.menuColor}
        />
        <CreatePicker
          label="Menu Accent"
          indicator={<span className="indicator-gem">◈</span>}
          onValueChange={(value) => updateFilter("menuAccent", value)}
          options={["all", ...options.menuAccents]}
          value={localFilters.menuAccent}
        />
      </div>
      <div className="filter-actions">
        <button className="btn btn-primary" onClick={applyFilters} type="button">
          Apply Filters
        </button>
        <Link className="btn btn-secondary" href={`/?size=${pageSize}`}>
          Clear
        </Link>
      </div>
    </Card>
  )
}
