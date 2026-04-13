import {
  PRESET_ICON_LIBRARIES,
  PRESET_SERIF_FONTS,
  PRESET_STYLES,
  PRESET_THEMES,
  type PresetConfig,
} from "shadcn/preset"

const SERIF_FONTS = new Set<PresetConfig["font"]>(PRESET_SERIF_FONTS)

type FontFamilyConstraint = "serif" | "sans"
export type TypographyConstraints = {
  headingFamily?: FontFamilyConstraint
  bodyFamily?: FontFamilyConstraint
}

export type PaletteConstraints = {
  wantsMonochrome: boolean
}

export type RequestedFacetChanges = {
  style: boolean
  baseColor: boolean
  theme: boolean
  chartColor: boolean
  iconLibrary: boolean
  radius: boolean
  menuColor: boolean
  menuAccent: boolean
  typographyHeading: boolean
  typographyBody: boolean
}

export type ExplicitFacetConstraints = {
  style?: PresetConfig["style"]
  menuTone?: "light" | "dark"
  chartColor?: PresetConfig["chartColor"]
}

const COLOR_WORDS = [...new Set(PRESET_THEMES)] as PresetConfig["theme"][]
const COLOR_WORDS_REGEX = new RegExp(`\\b(${COLOR_WORDS.join("|")})\\b`)
const ICON_WORDS_REGEX = new RegExp(
  `\\b(icon|icons|${PRESET_ICON_LIBRARIES.join("|")})\\b`
)
const STYLE_WORDS_REGEX = new RegExp(
  `\\b(${PRESET_STYLES.join("|")})\\b`
)

export function extractTypographyConstraints(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): TypographyConstraints {
  const constraints: TypographyConstraints = {}
  for (const msg of messages) {
    if (msg.role !== "user") continue
    const t = msg.content.toLowerCase()

    if (
      /(serif)\s+headings?/.test(t) ||
      /headings?\s+(should|must|to)?\s*be\s+serif/.test(t)
    ) {
      constraints.headingFamily = "serif"
    }
    if (
      /\bsans\s+headings?\b/.test(t) ||
      /(sans[-\s]?serif)\s+headings?/.test(t) ||
      /headings?\s+(should|must|to)?\s*be\s+(sans[-\s]?serif)/.test(t)
    ) {
      constraints.headingFamily = "sans"
    }

    if (
      /(serif)\s+body/.test(t) ||
      /body\s+(should|must|to)?\s*be\s+serif/.test(t)
    ) {
      constraints.bodyFamily = "serif"
    }
    if (
      /\bsans\s+body\b/.test(t) ||
      /(sans[-\s]?serif)\s+body/.test(t) ||
      /body\s+(should|must|to)?\s*be\s+(sans[-\s]?serif)/.test(t)
    ) {
      constraints.bodyFamily = "sans"
    }
  }

  return constraints
}

export function extractPaletteConstraints(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): PaletteConstraints {
  let wantsMonochrome = false

  for (const msg of messages) {
    if (msg.role !== "user") continue
    const t = msg.content.toLowerCase()

    const asksMonochrome =
      /\bmonochrome\b/.test(t) ||
      /\bmonochromatic\b/.test(t) ||
      /\bgrayscale\b/.test(t) ||
      /\bblack and white\b/.test(t) ||
      /\bgrey[-\s]?scale\b/.test(t)

    const asksSpecificColorAccent =
      COLOR_WORDS_REGEX.test(t) &&
      /\b(accent|accents|chart|charts|theme|palette)\b/.test(t)

    if (asksMonochrome) {
      wantsMonochrome = true
    } else if (asksSpecificColorAccent) {
      wantsMonochrome = false
    }
  }

  return { wantsMonochrome }
}

export function detectRequestedFacetChanges(
  lastUserText: string
): RequestedFacetChanges {
  const t = lastUserText.toLowerCase()
  const mentionsColorWord =
    COLOR_WORDS_REGEX.test(t) ||
    /\b(grey|monochrome|monochromatic|grayscale|black and white)\b/.test(t)
  const mentionsChart = /\b(chart|charts)\b/.test(t)
  const mentionsTheme = /\b(theme|palette|accent|accents|colour|color|colors|colours)\b/.test(
    t
  )
  const mentionsStyle =
    STYLE_WORDS_REGEX.test(t) || /\bstyle\b/.test(t) || /\blayout\b/.test(t)
  const mentionsHeadingTypography =
    /\b(heading|headings)\b/.test(t) &&
    /\b(font|fonts|serif|sans)\b/.test(t)
  const mentionsBodyTypography =
    /\bbody\b/.test(t) && /\b(font|fonts|serif|sans)\b/.test(t)
  const mentionsGenericTypography =
    /\b(font|fonts)\b/.test(t) &&
    !mentionsHeadingTypography &&
    !mentionsBodyTypography
  const mentionsIcons = ICON_WORDS_REGEX.test(t)
  const mentionsRadius = /\b(radius|rounded|sharp|corners?)\b/.test(t)
  const mentionsMenu = /\b(menu|sidebar|chrome)\b/.test(t)
  const mentionsMenuAccent = mentionsMenu && /\baccent\b/.test(t)

  return {
    style: mentionsStyle,
    baseColor: mentionsTheme && mentionsColorWord && !mentionsChart,
    theme: mentionsTheme && mentionsColorWord,
    chartColor: mentionsChart || (mentionsTheme && /\bchart\b/.test(t)),
    iconLibrary: mentionsIcons,
    radius: mentionsRadius,
    menuColor: mentionsMenu,
    menuAccent: mentionsMenuAccent,
    typographyHeading: mentionsHeadingTypography || mentionsGenericTypography,
    typographyBody: mentionsBodyTypography || mentionsGenericTypography,
  }
}

export function extractExplicitFacetConstraints(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): ExplicitFacetConstraints {
  const out: ExplicitFacetConstraints = {}
  const styleNames: PresetConfig["style"][] = [...PRESET_STYLES]
  const chartColorByWord: Record<string, PresetConfig["chartColor"]> =
    Object.fromEntries(PRESET_THEMES.map((t) => [t, t])) as Record<
      string,
      PresetConfig["chartColor"]
    >
  chartColorByWord.grey = "gray"

  for (const msg of messages) {
    if (msg.role !== "user") continue
    const t = msg.content.toLowerCase()

    for (const style of styleNames) {
      if (new RegExp(`\\b${style}\\b`).test(t)) out.style = style
    }

    if (
      /\b(dark|inverted)\b/.test(t) &&
      /\b(menu|sidebar|chrome)\b/.test(t)
    ) {
      out.menuTone = "dark"
    } else if (
      /\b(light|default)\b/.test(t) &&
      /\b(menu|sidebar|chrome)\b/.test(t)
    ) {
      out.menuTone = "light"
    }

    if (/\b(chart|charts)\b/.test(t)) {
      for (const [word, color] of Object.entries(chartColorByWord)) {
        if (new RegExp(`\\b${word}\\b`).test(t)) out.chartColor = color
      }
    }
  }

  return out
}

export function applyTypographyConstraints(
  config: PresetConfig,
  constraints: TypographyConstraints
): PresetConfig {
  const next = { ...config }

  if (constraints.headingFamily === "serif") {
    const hasSerifHeading =
      next.fontHeading !== "inherit" && SERIF_FONTS.has(next.fontHeading)
    if (!hasSerifHeading) next.fontHeading = "lora"
  } else if (constraints.headingFamily === "sans") {
    if (next.fontHeading === "inherit" || SERIF_FONTS.has(next.fontHeading)) {
      next.fontHeading = "inter"
    }
  }

  if (constraints.bodyFamily === "serif") {
    if (!SERIF_FONTS.has(next.font)) next.font = "lora"
  } else if (constraints.bodyFamily === "sans") {
    if (SERIF_FONTS.has(next.font)) next.font = "inter"
  }

  return next
}

export function applyPaletteConstraints(
  config: PresetConfig,
  constraints: PaletteConstraints
): PresetConfig {
  if (!constraints.wantsMonochrome) return config
  return { ...config, chartColor: config.theme }
}

export function applyExplicitFacetConstraints(
  config: PresetConfig,
  constraints: ExplicitFacetConstraints
): PresetConfig {
  const next = { ...config }
  if (constraints.style) next.style = constraints.style
  if (constraints.chartColor) next.chartColor = constraints.chartColor
  if (constraints.menuTone === "dark") {
    next.menuColor = next.menuColor.includes("translucent")
      ? "inverted-translucent"
      : "inverted"
  } else if (constraints.menuTone === "light") {
    next.menuColor = next.menuColor.includes("translucent")
      ? "default-translucent"
      : "default"
  }
  return next
}

export function applyStagePreservation(
  config: PresetConfig,
  previous: PresetConfig | undefined,
  changes: RequestedFacetChanges
): PresetConfig {
  if (!previous) return config
  return {
    style: changes.style ? config.style : previous.style,
    baseColor: changes.baseColor ? config.baseColor : previous.baseColor,
    theme: changes.theme ? config.theme : previous.theme,
    chartColor: changes.chartColor ? config.chartColor : previous.chartColor,
    iconLibrary: changes.iconLibrary ? config.iconLibrary : previous.iconLibrary,
    font: changes.typographyBody ? config.font : previous.font,
    fontHeading: changes.typographyHeading
      ? config.fontHeading
      : previous.fontHeading,
    radius: changes.radius ? config.radius : previous.radius,
    menuColor: changes.menuColor ? config.menuColor : previous.menuColor,
    menuAccent: changes.menuAccent ? config.menuAccent : previous.menuAccent,
  }
}

export function buildPresetCardDescription(c: PresetConfig): string {
  const chart = c.chartColor ?? c.theme
  const typo =
    c.fontHeading === "inherit" || c.fontHeading === c.font
      ? `${c.font} font`
      : `${c.fontHeading} & ${c.font} fonts`
  return `${c.baseColor} base, ${c.theme} theme, ${chart} charts, ${c.iconLibrary}, ${typo}`
}
