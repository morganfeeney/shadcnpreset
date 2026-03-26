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

function wrapHue(hue: number) {
  const value = hue % 360
  return value < 0 ? value + 360 : value
}

function oklch(lightness: number, chroma: number, hue: number) {
  return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${wrapHue(hue).toFixed(3)})`
}

export function buildThemeCssVars(config: ThemeConfig): ThemeCssVars {
  const baseHue = getHue(config.baseColor)
  const themeHue = getHue(config.theme)
  const chartHue = getHue(config.chartColor)

  const light = {
    background: oklch(0.985, 0.006, baseHue),
    foreground: oklch(0.185, 0.020, baseHue),
    card: oklch(0.994, 0.004, baseHue),
    "card-foreground": oklch(0.185, 0.020, baseHue),
    border: oklch(0.885, 0.012, baseHue),
    primary: oklch(0.615, 0.180, themeHue),
    "primary-foreground": oklch(0.975, 0.012, themeHue),
    secondary: oklch(0.940, 0.016, baseHue),
    "secondary-foreground": oklch(0.245, 0.028, baseHue),
    muted: oklch(0.944, 0.012, baseHue),
    "muted-foreground": oklch(0.520, 0.020, baseHue),
    accent: oklch(0.932, 0.016, baseHue),
    "accent-foreground": oklch(0.220, 0.026, baseHue),
    "chart-1": oklch(0.620, 0.175, chartHue),
    "chart-2": oklch(0.640, 0.155, chartHue + 20),
    "chart-3": oklch(0.665, 0.145, chartHue + 40),
    "chart-4": oklch(0.695, 0.130, chartHue + 60),
    "chart-5": oklch(0.725, 0.120, chartHue + 80),
    radius: "0.625rem",
  }
  const dark = {
    background: oklch(0.175, 0.010, baseHue),
    foreground: oklch(0.955, 0.010, baseHue),
    card: oklch(0.220, 0.014, baseHue),
    "card-foreground": oklch(0.955, 0.010, baseHue),
    border: oklch(0.330, 0.014, baseHue),
    primary: oklch(0.735, 0.170, themeHue),
    "primary-foreground": oklch(0.205, 0.038, themeHue),
    secondary: oklch(0.285, 0.018, baseHue),
    "secondary-foreground": oklch(0.950, 0.012, baseHue),
    muted: oklch(0.305, 0.014, baseHue),
    "muted-foreground": oklch(0.760, 0.016, baseHue),
    accent: oklch(0.320, 0.014, baseHue),
    "accent-foreground": oklch(0.950, 0.012, baseHue),
    "chart-1": oklch(0.700, 0.165, chartHue),
    "chart-2": oklch(0.725, 0.150, chartHue + 20),
    "chart-3": oklch(0.750, 0.140, chartHue + 40),
    "chart-4": oklch(0.775, 0.128, chartHue + 60),
    "chart-5": oklch(0.800, 0.116, chartHue + 80),
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
