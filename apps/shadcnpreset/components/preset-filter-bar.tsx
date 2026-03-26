"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"

import {
  Picker,
  PickerContent,
  PickerGroup,
  PickerRadioGroup,
  PickerRadioItem,
  PickerTrigger,
} from "@/app/(create)/components/picker"
import { FieldGroup, FieldSeparator } from "@/components/ui/field"
import { Button, buttonVariants } from "@/components/ui/button"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useIsMobile } from "@/hooks/use-mobile"
import { getPresetSwatchPair } from "@/lib/oklch-swatch"
import type { PresetFilters } from "@/lib/preset-catalog"
import type { PresetConfig } from "@/lib/preset-codec"


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

function formatPickerValue(value: string) {
  return value
    .split("-")
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
    .join(" ")
}

type FilterPickerProps = {
  label: string
  value: string
  options: readonly string[]
  onValueChange: (value: string) => void
  indicator?: React.ReactNode
  isMobile: boolean
  anchorRef: React.RefObject<HTMLDivElement | null>
}

function FilterPicker({
  label,
  value,
  options,
  onValueChange,
  indicator,
  isMobile,
  anchorRef,
}: FilterPickerProps) {
  return (
    <Picker>
      <PickerTrigger className="w-full text-left">
        <span className="create-picker-label">{label}</span>
        <span className="create-picker-value-row">
          <span className="create-picker-value">{formatPickerValue(value)}</span>
          {indicator ? (
            <span aria-hidden="true" className="create-picker-indicator">
              {indicator}
            </span>
          ) : (
            <span aria-hidden="true" className="create-picker-caret">
              <svg
                aria-hidden="true"
                className="create-picker-caret-icon"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </span>
      </PickerTrigger>
      <PickerContent
        anchor={isMobile ? anchorRef : undefined}
        side={isMobile ? "top" : "right"}
        align={isMobile ? "center" : "start"}
      >
        <PickerRadioGroup value={value} onValueChange={onValueChange}>
          <PickerGroup>
            {options.map((option) => (
              <PickerRadioItem key={option} value={option} closeOnClick={isMobile}>
                {formatPickerValue(option)}
              </PickerRadioItem>
            ))}
          </PickerGroup>
        </PickerRadioGroup>
      </PickerContent>
    </Picker>
  )
}

export function PresetFilterBar({
  filters,
  pageSize,
  options,
}: PresetFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const anchorRef = React.useRef<HTMLDivElement | null>(null)
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
    [options]
  )

  const indicatorConfig = React.useMemo(
    () =>
      ({
        baseColor:
          localFilters.baseColor === "all"
            ? "neutral"
            : localFilters.baseColor,
        theme: localFilters.theme === "all" ? "neutral" : localFilters.theme,
        chartColor:
          localFilters.chartColor === "all"
            ? "neutral"
            : localFilters.chartColor,
        menuAccent: localFilters.menuAccent === "bold" ? "bold" : "subtle",
        radius:
          localFilters.radius === "none" ||
          localFilters.radius === "small" ||
          localFilters.radius === "medium" ||
          localFilters.radius === "large"
            ? localFilters.radius
            : "default",
      }) as Pick<
        PresetConfig,
        "baseColor" | "theme" | "chartColor" | "menuAccent" | "radius"
      >,
    [
      localFilters.baseColor,
      localFilters.theme,
      localFilters.chartColor,
      localFilters.menuAccent,
      localFilters.radius,
    ]
  )

  const baseColorIndicator = React.useMemo(() => {
    if (localFilters.baseColor === "all") {
      return undefined
    }

    return getPresetSwatchPair(indicatorConfig, "mutedForeground").dark
  }, [indicatorConfig, localFilters.baseColor])

  const themeIndicator = React.useMemo(() => {
    if (localFilters.theme === "all") {
      return undefined
    }

    return getPresetSwatchPair(indicatorConfig, "primary").dark
  }, [indicatorConfig, localFilters.theme])

  const chartColorIndicator = React.useMemo(() => {
    if (localFilters.chartColor === "all") {
      return undefined
    }

    return getPresetSwatchPair(indicatorConfig, "chart1").dark
  }, [indicatorConfig, localFilters.chartColor])

  function updateFilter<K extends keyof LocalFilters>(
    key: K,
    value: LocalFilters[K]
  ) {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
  }

  function buildFilterParams(nextFilters: LocalFilters) {
    const params = new URLSearchParams()
    params.set("size", String(pageSize))
    params.set("page", "1")
    if (nextFilters.style !== "all") params.set("style", nextFilters.style)
    if (nextFilters.baseColor !== "all")
      params.set("baseColor", nextFilters.baseColor)
    if (nextFilters.theme !== "all") params.set("theme", nextFilters.theme)
    if (nextFilters.chartColor !== "all")
      params.set("chartColor", nextFilters.chartColor)
    if (nextFilters.fontHeading !== "all")
      params.set("fontHeading", nextFilters.fontHeading)
    if (nextFilters.font !== "all") params.set("font", nextFilters.font)
    if (nextFilters.iconLibrary !== "all")
      params.set("iconLibrary", nextFilters.iconLibrary)
    if (nextFilters.radius !== "all") params.set("radius", nextFilters.radius)
    if (nextFilters.menuColor !== "all")
      params.set("menuColor", nextFilters.menuColor)
    if (nextFilters.menuAccent !== "all")
      params.set("menuAccent", nextFilters.menuAccent)
    return params
  }

  function applyFilters(nextFilters = localFilters) {
    const params = buildFilterParams(nextFilters)
    router.push(`${pathname}?${params.toString()}`)
  }

  function updateFilterAndApply<K extends keyof LocalFilters>(
    key: K,
    value: LocalFilters[K]
  ) {
    const nextFilters = { ...localFilters, [key]: value }
    updateFilter(key, value)
    applyFilters(nextFilters)
  }

  return (
    <Card
      size="sm"
      ref={anchorRef}
      className="dark top-24 right-12 isolate z-10 max-h-full min-h-0 w-full self-start rounded-2xl bg-card/90 shadow-xl backdrop-blur-xl md:w-(--customizer-width)"
    >
      <CardHeader className="hidden items-center justify-between gap-2 border-b group-data-reversed/layout:flex-row-reverse md:flex">
        <span>Filter presets</span>
        <span className="preset-customizer-menu-icon" aria-hidden="true">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 6H15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M9 10H15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </CardHeader>
      <CardContent className="no-scrollbar min-h-0 flex-1 overflow-x-auto overflow-y-hidden md:overflow-y-auto">
        <FieldGroup className="flex-row gap-2.5 py-px **:data-[slot=field-separator]:-mx-4 **:data-[slot=field-separator]:w-auto md:flex-col md:gap-3.25">
          <FilterPicker
            anchorRef={anchorRef}
            isMobile={isMobile}
            label="Style"
            indicator={<span className="indicator-square" />}
            onValueChange={(value) => updateFilterAndApply("style", value)}
            options={["all", ...options.styles]}
            value={localFilters.style}
          />
          <FieldSeparator className="hidden md:block" />
          <FilterPicker
            anchorRef={anchorRef}
            isMobile={isMobile}
            label="Base Color"
            indicator={
              <span
                className="indicator-dot indicator-color"
                style={
                  baseColorIndicator
                    ? ({
                        "--indicator-color": baseColorIndicator,
                      } as React.CSSProperties)
                    : undefined
                }
              />
            }
            onValueChange={(value) => updateFilterAndApply("baseColor", value)}
            options={["all", ...options.baseColors]}
            value={localFilters.baseColor}
          />
          <FilterPicker
            anchorRef={anchorRef}
            isMobile={isMobile}
            label="Theme"
            indicator={
              <span
                className="indicator-dot indicator-color"
                style={
                  themeIndicator
                    ? ({
                        "--indicator-color": themeIndicator,
                      } as React.CSSProperties)
                    : undefined
                }
              />
            }
            onValueChange={(value) => updateFilterAndApply("theme", value)}
            options={["all", ...themeOptions]}
            value={localFilters.theme}
          />
          <FilterPicker
            anchorRef={anchorRef}
            isMobile={isMobile}
            label="Chart Color"
            indicator={
              <span
                className="indicator-dot indicator-color"
                style={
                  chartColorIndicator
                    ? ({
                        "--indicator-color": chartColorIndicator,
                      } as React.CSSProperties)
                    : undefined
                }
              />
            }
            onValueChange={(value) => updateFilterAndApply("chartColor", value)}
            options={["all", ...options.chartColors]}
            value={localFilters.chartColor}
          />
          <FieldSeparator className="hidden md:block" />
          <FilterPicker
            anchorRef={anchorRef}
            isMobile={isMobile}
            label="Heading"
            indicator={<span className="indicator-aa">Aa</span>}
            onValueChange={(value) => updateFilterAndApply("fontHeading", value)}
            options={["all", ...options.fontHeadings]}
            value={localFilters.fontHeading}
          />
          <FilterPicker
            anchorRef={anchorRef}
            isMobile={isMobile}
            label="Font"
            indicator={<span className="indicator-aa">Aa</span>}
            onValueChange={(value) => updateFilterAndApply("font", value)}
            options={["all", ...options.fonts]}
            value={localFilters.font}
          />
          <FieldSeparator className="hidden md:block" />
          <FilterPicker
            anchorRef={anchorRef}
            isMobile={isMobile}
            label="Icon Library"
            indicator={<span className="indicator-swirl">◌</span>}
            onValueChange={(value) => updateFilterAndApply("iconLibrary", value)}
            options={["all", ...options.iconLibraries]}
            value={localFilters.iconLibrary}
          />
          <FilterPicker
            anchorRef={anchorRef}
            isMobile={isMobile}
            label="Radius"
            indicator={<span className="indicator-corner" />}
            onValueChange={(value) => updateFilterAndApply("radius", value)}
            options={["all", ...options.radii]}
            value={localFilters.radius}
          />
          <FieldSeparator className="hidden md:block" />
          <FilterPicker
            anchorRef={anchorRef}
            isMobile={isMobile}
            label="Menu"
            indicator={<span className="indicator-menu">☰</span>}
            onValueChange={(value) => updateFilterAndApply("menuColor", value)}
            options={["all", ...options.menuColors]}
            value={localFilters.menuColor}
          />
          <FilterPicker
            anchorRef={anchorRef}
            isMobile={isMobile}
            label="Menu Accent"
            indicator={<span className="indicator-gem">◈</span>}
            onValueChange={(value) => updateFilterAndApply("menuAccent", value)}
            options={["all", ...options.menuAccents]}
            value={localFilters.menuAccent}
          />
        </FieldGroup>
      </CardContent>
      <CardFooter className="flex min-w-0 gap-2 md:flex-col md:**:[button,a]:w-full">
        <Button onClick={applyFilters}>Apply Filters</Button>
        <Link
          className={buttonVariants({ variant: "secondary" })}
          href={`/?size=${pageSize}`}
        >
          Clear
        </Link>
      </CardFooter>
    </Card>
  )
}
