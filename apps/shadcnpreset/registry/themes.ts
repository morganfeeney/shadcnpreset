import { buildThemeCssVars } from "@/lib/theme"

const THEME_NAMES = [
  "neutral",
  "stone",
  "zinc",
  "mauve",
  "olive",
  "mist",
  "taupe",
  "amber",
  "blue",
  "cyan",
  "emerald",
  "fuchsia",
  "green",
  "indigo",
  "lime",
  "orange",
  "pink",
  "purple",
  "red",
  "rose",
  "sky",
  "teal",
  "violet",
  "yellow",
] as const

function toTitle(name: string) {
  return name
    .split("-")
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
    .join(" ")
}

export const THEMES = THEME_NAMES.map((name) => ({
  name,
  title: toTitle(name),
  type: "registry:theme" as const,
  cssVars: buildThemeCssVars({
    baseColor: "neutral",
    theme: name,
    chartColor: name,
    menuAccent: "subtle",
    radius: "default",
  }),
}))

export type Theme = (typeof THEMES)[number]
