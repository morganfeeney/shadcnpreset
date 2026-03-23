import Link from "next/link"
import type { CSSProperties } from "react"

import { PresetFilterBar } from "@/components/preset-filter-bar"
import { PresetForm } from "@/components/preset-form"
import { getThemeSwatchPair } from "@/lib/oklch-swatch"
import {
  PRESET_TOTAL_COMBINATIONS,
  PRESET_FILTER_OPTIONS,
  getPresetPage,
  getPresetTotalCombinations,
  type PresetFilters,
} from "@/lib/preset-catalog"

type HomePageProps = {
  searchParams: Promise<{
    page?: string
    size?: string
    style?: string
    baseColor?: string
    theme?: string
    chartColor?: string
    font?: string
    iconLibrary?: string
  }>
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function readFilterParam(value: string | undefined) {
  if (!value || value === "all") {
    return undefined
  }
  return value
}

function swatchStyle(light: string, dark: string) {
  return {
    "--swatch-light": light,
    "--swatch-dark": dark,
  } as CSSProperties
}

function chartColorLabel(chartColor?: string) {
  return `chart:${chartColor ?? "neutral"}`
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams
  const pageSize = Math.min(100, parsePositiveInt(resolvedSearchParams.size, 20))
  const page = parsePositiveInt(resolvedSearchParams.page, 1)
  const filters: PresetFilters = {
    style: readFilterParam(resolvedSearchParams.style) as PresetFilters["style"],
    baseColor: readFilterParam(
      resolvedSearchParams.baseColor
    ) as PresetFilters["baseColor"],
    theme: readFilterParam(resolvedSearchParams.theme) as PresetFilters["theme"],
    chartColor: readFilterParam(
      resolvedSearchParams.chartColor
    ) as PresetFilters["chartColor"],
    font: readFilterParam(resolvedSearchParams.font) as PresetFilters["font"],
    iconLibrary: readFilterParam(
      resolvedSearchParams.iconLibrary
    ) as PresetFilters["iconLibrary"],
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
  if (filters.font) queryParams.set("font", filters.font)
  if (filters.iconLibrary) queryParams.set("iconLibrary", filters.iconLibrary)

  function pageHref(nextPage: number) {
    const params = new URLSearchParams(queryParams)
    params.set("page", String(nextPage))
    return `/?${params.toString()}`
  }

  return (
    <main className="page-wrap preset-page">
      <section className="preset-hero">
        <p className="eyebrow">shadcnpreset</p>
        <h1>Preset route viewer</h1>
        <p>
          Explore generated preset codes and open each one against the real v4
          create UI with the preset applied.
        </p>
        <PresetForm />
        <p>
          Need a reference? Open{" "}
          <Link href="http://localhost:4000/create" target="_blank">
            shadcn create
          </Link>{" "}
          and copy the `preset` query value.
        </p>
      </section>

      <section className="preset-browser">
        <div className="preset-browser-head">
          <h2>Preset browser</h2>
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
        </div>

        <PresetFilterBar
          filters={filters}
          options={PRESET_FILTER_OPTIONS}
          pageSize={pageSize}
        />

        <div className="preset-nav">
          {hasPrevious ? <Link href={pageHref(safePage - 1)}>Previous</Link> : <span>Previous</span>}
          <span>
            Page <code>{safePage.toLocaleString()}</code> of{" "}
            <code>{totalPages.toLocaleString()}</code>
          </span>
          {hasNext ? <Link href={pageHref(safePage + 1)}>Next</Link> : <span>Next</span>}
        </div>

        <ul className="preset-grid">
          {presets.map((item) => (
            <li className="preset-card" key={item.index}>
              <div className="preset-card-top">
                <Link href={`/preset/${item.code}`}>Preset {item.index + 1}</Link>
                <code>{item.code}</code>
              </div>
              <div className="preset-swatches">
                {(() => {
                  const chartColor = item.config.chartColor ?? "neutral"
                  const basePair = getThemeSwatchPair(
                    item.config.baseColor,
                    "background"
                  )
                  const themePair = getThemeSwatchPair(item.config.theme, "primary")
                  const chartPair = getThemeSwatchPair(chartColor, "primary")

                  return (
                    <>
                      <span
                        className="swatch"
                        style={swatchStyle(basePair.light, basePair.dark)}
                        title={`Base OKLCH: ${basePair.light} / ${basePair.dark}`}
                      />
                      <span
                        className="swatch"
                        style={swatchStyle(themePair.light, themePair.dark)}
                        title={`Theme OKLCH: ${themePair.light} / ${themePair.dark}`}
                      />
                      <span
                        className="swatch"
                        style={swatchStyle(chartPair.light, chartPair.dark)}
                        title={`Chart color OKLCH: ${chartPair.light} / ${chartPair.dark}`}
                      />
                    </>
                  )
                })()}
              </div>
              <div className="preset-tags">
                <span>{item.config.style}</span>
                <span>{item.config.baseColor}</span>
                <span>{item.config.theme}</span>
                <span>{chartColorLabel(item.config.chartColor)}</span>
                <span>{item.config.font}</span>
                <span>{item.config.iconLibrary}</span>
              </div>
              <div className="preset-actions">
                <Link href={`/preset/${item.code}`}>Open</Link>
                <Link
                  href={`${
                    process.env.NEXT_PUBLIC_V4_URL ?? "http://localhost:4000"
                  }/create?preset=${item.code}`}
                  target="_blank"
                >
                  Open in v4
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
