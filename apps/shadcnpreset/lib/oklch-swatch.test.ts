import assert from "node:assert/strict"
import test from "node:test"

import { decodePreset } from "@/lib/preset-codec"
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

function assertPresetSwatchesMatchRegistry(config: Parameters<typeof buildRegistryTheme>[0]) {
  const registryTheme = buildRegistryTheme({ ...DEFAULT_CONFIG, ...config })
  const lightVars = registryTheme.cssVars.light
  const darkVars = registryTheme.cssVars.dark

  for (const [role, token] of ROLE_TO_TOKEN) {
    const pair = getPresetSwatchPair(config, role)
    assert.equal(
      pair.light,
      lightVars[token] ?? lightVars.primary,
      `Expected light ${role} to match registry token ${token}`
    )
    assert.equal(
      pair.dark,
      darkVars[token] ?? darkVars.primary,
      `Expected dark ${role} to match registry token ${token}`
    )
  }
}

test("swatches match registry theme for preset bw4UuDRY", () => {
  const config = decodePreset("bw4UuDRY")
  assertPresetSwatchesMatchRegistry(config)
})

test("swatches match registry theme for a page of generated presets", () => {
  const presets = getPresetPage(1, 40, {})
  assert.ok(presets.length > 0, "Expected at least one generated preset")

  for (const preset of presets) {
    assertPresetSwatchesMatchRegistry(preset.config)
  }
})
