import { buildThemeCssVars } from "@/lib/theme"

const BASE_COLOR_NAMES = [
  "neutral",
  "stone",
  "zinc",
  "mauve",
  "olive",
  "mist",
  "taupe",
] as const

function toTitle(name: string) {
  return name
    .split("-")
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
    .join(" ")
}

export const BASE_COLORS = BASE_COLOR_NAMES.map((name) => ({
  name,
  title: toTitle(name),
  type: "registry:theme" as const,
  cssVars: buildThemeCssVars({
    baseColor: name,
    theme: "neutral",
    chartColor: "neutral",
    menuAccent: "subtle",
    radius: "default",
  }),
}))

export type BaseColor = (typeof BASE_COLORS)[number]
