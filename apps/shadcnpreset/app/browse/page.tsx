import Link from "next/link"

import { HomeHero } from "@/components/home-hero"
import { PresetFilterBar } from "@/components/preset-filter-bar"
import { PresetCard } from "@/components/preset-card"
import {
  PRESET_TOTAL_COMBINATIONS,
  PRESET_FILTER_OPTIONS,
  getPresetPage,
  getPresetTotalCombinations,
  type PresetFilters,
} from "@/lib/preset-catalog"

type BrowsePageProps = {
  searchParams: Promise<{
    page?: string
    size?: string
    style?: string
    baseColor?: string
    theme?: string
    chartColor?: string
    fontHeading?: string
    font?: string
    iconLibrary?: string
    radius?: string
    menuColor?: string
    menuAccent?: string
  }>
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function readFilterParam(
  value: string | undefined,
  allowedValues?: readonly string[]
) {
  if (!value || value === "all") {
    return undefined
  }
  if (allowedValues && !allowedValues.includes(value)) {
    return undefined
  }
  return value
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const resolvedSearchParams = await searchParams
  const pageSize = Math.min(100, parsePositiveInt(resolvedSearchParams.size, 20))
  const page = parsePositiveInt(resolvedSearchParams.page, 1)
  const filters: PresetFilters = {
    style: readFilterParam(
      resolvedSearchParams.style,
      PRESET_FILTER_OPTIONS.styles
    ) as PresetFilters["style"],
    baseColor: readFilterParam(
      resolvedSearchParams.baseColor,
      PRESET_FILTER_OPTIONS.baseColors
    ) as PresetFilters["baseColor"],
    theme: readFilterParam(
      resolvedSearchParams.theme,
      PRESET_FILTER_OPTIONS.themes
    ) as PresetFilters["theme"],
    chartColor: readFilterParam(
      resolvedSearchParams.chartColor,
      PRESET_FILTER_OPTIONS.chartColors
    ) as PresetFilters["chartColor"],
    fontHeading: readFilterParam(
      resolvedSearchParams.fontHeading,
      PRESET_FILTER_OPTIONS.fontHeadings
    ) as PresetFilters["fontHeading"],
    font: readFilterParam(
      resolvedSearchParams.font,
      PRESET_FILTER_OPTIONS.fonts
    ) as PresetFilters["font"],
    iconLibrary: readFilterParam(
      resolvedSearchParams.iconLibrary,
      PRESET_FILTER_OPTIONS.iconLibraries
    ) as PresetFilters["iconLibrary"],
    radius: readFilterParam(
      resolvedSearchParams.radius,
      PRESET_FILTER_OPTIONS.radii
    ) as PresetFilters["radius"],
    menuColor: readFilterParam(
      resolvedSearchParams.menuColor,
      PRESET_FILTER_OPTIONS.menuColors
    ) as PresetFilters["menuColor"],
    menuAccent: readFilterParam(
      resolvedSearchParams.menuAccent,
      PRESET_FILTER_OPTIONS.menuAccents
    ) as PresetFilters["menuAccent"],
  }
  const filteredTotal = getPresetTotalCombinations(filters)
  const totalPages = Math.max(1, Math.ceil(filteredTotal / pageSize))
  const safePage = Math.min(page, totalPages)
  const presets = getPresetPage(safePage, pageSize, filters)
  const hasPrevious = page > 1
  const hasNext = safePage < totalPages
  const from = presets.length ? presets[0].index + 1 : 0
  const to = presets.length ? presets[presets.length - 1].index + 1 : 0
  const queryParams = new URLSearchParams()
  queryParams.set("size", String(pageSize))
  if (filters.style) queryParams.set("style", filters.style)
  if (filters.baseColor) queryParams.set("baseColor", filters.baseColor)
  if (filters.theme) queryParams.set("theme", filters.theme)
  if (filters.chartColor) queryParams.set("chartColor", filters.chartColor)
  if (filters.fontHeading) queryParams.set("fontHeading", filters.fontHeading)
  if (filters.font) queryParams.set("font", filters.font)
  if (filters.iconLibrary) queryParams.set("iconLibrary", filters.iconLibrary)
  if (filters.radius) queryParams.set("radius", filters.radius)
  if (filters.menuColor) queryParams.set("menuColor", filters.menuColor)
  if (filters.menuAccent) queryParams.set("menuAccent", filters.menuAccent)

  function pageHref(nextPage: number) {
    const params = new URLSearchParams(queryParams)
    params.set("page", String(nextPage))
    return `/browse?${params.toString()}`
  }

  return (
    <div
      data-slot="layout"
      className="group/layout section-soft relative z-10 mx-auto grid w-full max-w-[1800px] gap-(--gap) p-(--gap) [--gap:--spacing(4)] md:[--gap:--spacing(6)] 2xl:[--customizer-width:--spacing(56)]"
    >
      <HomeHero />
      <main id="browse" className="grid grid-cols-[224px_1fr] gap-(--gap)">
        <PresetFilterBar
          filters={filters}
          options={PRESET_FILTER_OPTIONS}
          pageSize={pageSize}
        />

        <div className="preset-browser-content">
          <div className="preset-stats">
            <span>
              Total: <code>{PRESET_TOTAL_COMBINATIONS.toLocaleString()}</code>
            </span>
            <span>
              Filtered: <code>{filteredTotal.toLocaleString()}</code>
            </span>
            <span>
              Showing <code>{from.toLocaleString()}</code>-
              <code>{to.toLocaleString()}</code>
            </span>
            <span>Mode: works in both light and dark</span>
          </div>

          <div className="preset-nav">
            {hasPrevious ? (
              <Link href={pageHref(safePage - 1)}>Previous</Link>
            ) : (
              <span>Previous</span>
            )}
            <span>
              Page <code>{safePage.toLocaleString()}</code> of{" "}
              <code>{totalPages.toLocaleString()}</code>
            </span>
            {hasNext ? (
              <Link href={pageHref(safePage + 1)}>Next</Link>
            ) : (
              <span>Next</span>
            )}
          </div>

          <ul className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(350px,1fr))]">
            {presets.map((item) => (
              <PresetCard item={item} key={item.index} />
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}
