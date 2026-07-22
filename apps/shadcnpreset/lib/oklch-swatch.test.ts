import { describe, expect, it } from "vitest"

import { decodePreset, type PresetConfig } from "shadcn/preset"
import { getPresetPage } from "@/lib/preset-catalog"
import { getPresetSwatchPair } from "@/lib/oklch-swatch"
import { buildRegistryTheme, DEFAULT_CONFIG } from "@/registry/config"

const ROLE_TO_TOKEN = [
  ["background", "background"],
  ["primary", "primary"],
  ["chart1", "chart-1"],
  ["chart2", "chart-2"],
  ["chart3", "chart-3"],
  ["chart4", "chart-4"],
  ["chart5", "chart-5"],
] as const

function expectPresetSwatchesMatchBuilder(
  config: Pick<
    PresetConfig,
    "baseColor" | "theme" | "chartColor" | "menuAccent" | "radius"
  >
) {
  const theme = buildRegistryTheme({
    ...DEFAULT_CONFIG,
    ...config,
    chartColor: config.chartColor ?? config.theme,
  })
  const lightVars = theme.cssVars.light ?? {}
  const darkVars = theme.cssVars.dark ?? {}

  for (const [role, token] of ROLE_TO_TOKEN) {
    const pair = getPresetSwatchPair(config, role)
    expect(pair.light, `light ${role} vs ${token}`).toBe(
      lightVars[token] ?? lightVars.primary
    )
    expect(pair.dark, `dark ${role} vs ${token}`).toBe(
      darkVars[token] ?? darkVars.primary
    )
  }
}

describe("oklch swatches vs registry theme", () => {
  it("matches builder for preset bw4UuDRY", () => {
    const config = decodePreset("bw4UuDRY")
    expect(config).toBeTruthy()
    expectPresetSwatchesMatchBuilder({
      ...DEFAULT_CONFIG,
      ...config!,
      chartColor: config!.chartColor ?? config!.theme,
    })
  })

  it("matches builder for a page of generated presets", () => {
    const presets = getPresetPage(1, 40, {})
    expect(presets.length).toBeGreaterThan(0)

    for (const preset of presets) {
      expectPresetSwatchesMatchBuilder({
        ...DEFAULT_CONFIG,
        ...preset.config,
        chartColor: preset.config.chartColor ?? preset.config.theme,
      })
    }
  })
})
