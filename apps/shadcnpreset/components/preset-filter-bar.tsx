"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"

import { CreatePicker } from "@/components/create-picker"
import type { PresetFilters } from "@/lib/preset-catalog"

type PresetFilterBarProps = {
  filters: PresetFilters
  pageSize: number
  options: {
    styles: readonly string[]
    baseColors: readonly string[]
    themes: readonly string[]
    chartColors: readonly string[]
    fonts: readonly string[]
    iconLibraries: readonly string[]
  }
}

type LocalFilters = {
  style: string
  baseColor: string
  theme: string
  chartColor: string
  font: string
  iconLibrary: string
}

function toLocalFilters(filters: PresetFilters): LocalFilters {
  return {
    style: filters.style ?? "all",
    baseColor: filters.baseColor ?? "all",
    theme: filters.theme ?? "all",
    chartColor: filters.chartColor ?? "all",
    font: filters.font ?? "all",
    iconLibrary: filters.iconLibrary ?? "all",
  }
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
    if (localFilters.font !== "all") params.set("font", localFilters.font)
    if (localFilters.iconLibrary !== "all")
      params.set("iconLibrary", localFilters.iconLibrary)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="preset-filters">
      <CreatePicker
        label="Style"
        onValueChange={(value) => updateFilter("style", value)}
        options={["all", ...options.styles]}
        value={localFilters.style}
      />
      <CreatePicker
        label="Base Color"
        onValueChange={(value) => updateFilter("baseColor", value)}
        options={["all", ...options.baseColors]}
        value={localFilters.baseColor}
      />
      <CreatePicker
        label="Theme"
        onValueChange={(value) => updateFilter("theme", value)}
        options={["all", ...themeOptions]}
        value={localFilters.theme}
      />
      <CreatePicker
        label="Chart"
        onValueChange={(value) => updateFilter("chartColor", value)}
        options={["all", ...options.chartColors]}
        value={localFilters.chartColor}
      />
      <CreatePicker
        label="Font"
        onValueChange={(value) => updateFilter("font", value)}
        options={["all", ...options.fonts]}
        value={localFilters.font}
      />
      <CreatePicker
        label="Icons"
        onValueChange={(value) => updateFilter("iconLibrary", value)}
        options={["all", ...options.iconLibraries]}
        value={localFilters.iconLibrary}
      />
      <div className="filter-actions">
        <button className="btn btn-primary" onClick={applyFilters} type="button">
          Apply filters
        </button>
        <Link className="btn btn-secondary" href={`/?size=${pageSize}`}>
          Clear filters
        </Link>
      </div>
    </div>
  )
}
