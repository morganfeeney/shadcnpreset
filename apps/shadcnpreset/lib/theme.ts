export type ThemeCssVars = {
  light: Record<string, string>
  dark: Record<string, string>
}

const RADII: Record<string, string> = {
  none: "0",
  small: "0.45rem",
  medium: "0.625rem",
  large: "0.875rem",
}

type ThemeConfig = {
  baseColor: string
  theme: string
  chartColor: string
  menuAccent: "subtle" | "bold"
  radius: "default" | "none" | "small" | "medium" | "large"
}

const HUE_MAP: Record<string, number> = {
  neutral: 230,
  stone: 35,
  zinc: 220,
  gray: 220,
  amber: 60,
  blue: 230,
  cyan: 195,
  emerald: 155,
  fuchsia: 320,
  green: 130,
  indigo: 245,
  lime: 95,
  orange: 30,
  pink: 345,
  purple: 280,
  red: 18,
  rose: 8,
  sky: 205,
  teal: 175,
  violet: 265,
  yellow: 75,
  mauve: 290,
  olive: 92,
  mist: 190,
  taupe: 28,
}

function getHue(name: string) {
  return HUE_MAP[name] ?? HUE_MAP.neutral
}

function hsl(hue: number, saturation: number, lightness: number) {
  return `hsl(${hue} ${saturation}% ${lightness}%)`
}

export function buildThemeCssVars(config: ThemeConfig): ThemeCssVars {
  const baseHue = getHue(config.baseColor)
  const themeHue = getHue(config.theme)
  const chartHue = getHue(config.chartColor)

  const light = {
    background: hsl(baseHue, 20, 98),
    foreground: hsl(baseHue, 16, 12),
    card: hsl(baseHue, 24, 99),
    "card-foreground": hsl(baseHue, 16, 12),
    border: hsl(baseHue, 16, 86),
    primary: hsl(themeHue, 70, 45),
    "primary-foreground": hsl(themeHue, 30, 98),
    secondary: hsl(baseHue, 24, 94),
    "secondary-foreground": hsl(baseHue, 16, 20),
    muted: hsl(baseHue, 22, 94),
    "muted-foreground": hsl(baseHue, 10, 42),
    accent: hsl(baseHue, 22, 93),
    "accent-foreground": hsl(baseHue, 16, 16),
    "chart-1": hsl(chartHue, 68, 46),
    "chart-2": hsl((chartHue + 20) % 360, 58, 49),
    "chart-3": hsl((chartHue + 40) % 360, 56, 52),
    "chart-4": hsl((chartHue + 60) % 360, 56, 56),
    "chart-5": hsl((chartHue + 80) % 360, 52, 60),
    radius: "0.625rem",
  }
  const dark = {
    background: hsl(baseHue, 15, 10),
    foreground: hsl(baseHue, 18, 95),
    card: hsl(baseHue, 16, 15),
    "card-foreground": hsl(baseHue, 18, 95),
    border: hsl(baseHue, 12, 28),
    primary: hsl(themeHue, 72, 62),
    "primary-foreground": hsl(themeHue, 36, 12),
    secondary: hsl(baseHue, 14, 22),
    "secondary-foreground": hsl(baseHue, 16, 95),
    muted: hsl(baseHue, 12, 24),
    "muted-foreground": hsl(baseHue, 14, 70),
    accent: hsl(baseHue, 12, 25),
    "accent-foreground": hsl(baseHue, 16, 95),
    "chart-1": hsl(chartHue, 68, 58),
    "chart-2": hsl((chartHue + 20) % 360, 58, 62),
    "chart-3": hsl((chartHue + 40) % 360, 56, 66),
    "chart-4": hsl((chartHue + 60) % 360, 56, 70),
    "chart-5": hsl((chartHue + 80) % 360, 52, 73),
    radius: "0.625rem",
  }

  if (config.menuAccent === "bold") {
    light.accent = light.primary
    light["accent-foreground"] = light["primary-foreground"]
    dark.accent = dark.primary
    dark["accent-foreground"] = dark["primary-foreground"]
  }

  if (config.radius !== "default" && RADII[config.radius]) {
    light.radius = RADII[config.radius]
    dark.radius = RADII[config.radius]
  }

  return { light, dark }
}

function buildCssRule(selector: string, cssVars: Record<string, string>) {
  const declarations = Object.entries(cssVars)
    .map(([name, value]) => `  --${name}: ${value};`)
    .join("\n")
  return `${selector} {\n${declarations}\n}`
}

export function buildThemeCssText(cssVars: ThemeCssVars) {
  return [
    buildCssRule(":root", cssVars.light),
    buildCssRule(".theme-dark", cssVars.dark),
  ].join("\n\n")
}
