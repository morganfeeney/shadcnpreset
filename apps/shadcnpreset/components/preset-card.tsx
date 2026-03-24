import Link from "next/link"
import type { CSSProperties } from "react"

import { getThemeSwatchPair } from "@/lib/oklch-swatch"
import type { PresetPageItem } from "@/lib/preset-catalog"

type PresetCardProps = {
  item: PresetPageItem
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

export function PresetCard({ item }: PresetCardProps) {
  const chartColor = item.config.chartColor ?? "neutral"
  const basePair = getThemeSwatchPair(item.config.baseColor, "background")
  const themePair = getThemeSwatchPair(item.config.theme, "primary")
  const chartPair = getThemeSwatchPair(chartColor, "primary")

  return (
    <li className="preset-card">
      <div className="preset-card-top">
        <Link href={`/preset/${item.code}`}>Preset {item.index + 1}</Link>
        <code>{item.code}</code>
      </div>
      <div className="preset-swatches">
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
  )
}
