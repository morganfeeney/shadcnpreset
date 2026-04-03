import {
  V1_CHART_COLOR_MAP,
  decodePreset,
  encodePreset,
  isPresetCode,
  type PresetConfig,
} from "shadcn/preset"

export type ResolvedPreset = PresetConfig & {
  code: string
  isLegacyCode: boolean
  effectiveChartColor: PresetConfig["theme"]
  effectiveRadius: PresetConfig["radius"]
}

const FONT_STACKS: Record<string, string> = {
  inter: '"Inter", system-ui, sans-serif',
  "noto-sans": '"Noto Sans", system-ui, sans-serif',
  "nunito-sans": '"Nunito Sans", system-ui, sans-serif',
  figtree: '"Figtree", system-ui, sans-serif',
  roboto: '"Roboto", system-ui, sans-serif',
  raleway: '"Raleway", system-ui, sans-serif',
  "dm-sans": '"DM Sans", system-ui, sans-serif',
  "public-sans": '"Public Sans", system-ui, sans-serif',
  outfit: '"Outfit", system-ui, sans-serif',
  "jetbrains-mono": '"JetBrains Mono", monospace',
  geist: '"Geist", system-ui, sans-serif',
  "geist-mono": '"Geist Mono", monospace',
  lora: '"Lora", serif',
  merriweather: '"Merriweather", serif',
  "playfair-display": '"Playfair Display", serif',
  "noto-serif": '"Noto Serif", serif',
  "roboto-slab": '"Roboto Slab", serif',
  oxanium: '"Oxanium", system-ui, sans-serif',
  manrope: '"Manrope", system-ui, sans-serif',
  "space-grotesk": '"Space Grotesk", system-ui, sans-serif',
  montserrat: '"Montserrat", system-ui, sans-serif',
  "ibm-plex-sans": '"IBM Plex Sans", system-ui, sans-serif',
  "source-sans-3": '"Source Sans 3", system-ui, sans-serif',
  "instrument-sans": '"Instrument Sans", system-ui, sans-serif',
}

export function resolvePresetFromCode(code: string): ResolvedPreset | null {
  if (!isPresetCode(code)) {
    return null
  }

  const decoded = decodePreset(code)
  if (!decoded) {
    return null
  }

  if (encodePreset(decoded) !== code) {
    return null
  }

  const effectiveChartColor =
    decoded.chartColor ??
    (V1_CHART_COLOR_MAP[decoded.theme] as PresetConfig["theme"] | undefined) ??
    decoded.theme
  const effectiveRadius =
    decoded.style === "lyra"
      ? "none"
      : (decoded.radius as PresetConfig["radius"])

  return {
    ...decoded,
    code,
    isLegacyCode: code.startsWith("a"),
    effectiveChartColor,
    effectiveRadius,
  }
}

export function getCanonicalPresetCode(config: PresetConfig) {
  return encodePreset(config)
}

/** Matches v4 `PreviewSwitcher`: `/preview/radix/preview` vs `/preview/radix/preview-02`. */
export type PresetPreviewPageName = "preview" | "preview-02"

export const PRESET_PREVIEW_VIEWS: ReadonlyArray<{
  page: PresetPreviewPageName
  label: string
}> = [
  { page: "preview", label: "View 1" },
  { page: "preview-02", label: "View 2" },
] as const

/** Radix preview iframe URL (no customizer) — same origin as list cards. */
export function getPresetPreviewUrl(
  code: string,
  pageName: PresetPreviewPageName = "preview"
): string | null {
  const resolved = resolvePresetFromCode(code)
  if (!resolved) return null
  const v4BaseUrl = process.env.NEXT_PUBLIC_V4_URL ?? "http://localhost:4000"
  const previewUrl = new URL(`/preview/radix/${pageName}`, v4BaseUrl)
  previewUrl.searchParams.set("preset", code)
  previewUrl.searchParams.set("iconLibrary", resolved.iconLibrary)
  return previewUrl.toString()
}

export function getFontFamily(font: string) {
  return FONT_STACKS[font] ?? '"Geist", system-ui, sans-serif'
}
