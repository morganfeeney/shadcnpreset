import {
  effectiveHeadingFont,
  getFontDisplayName,
  type ResolvedPreset,
} from "@/lib/preset"
import { STYLES } from "@/registry/styles"
import { THEMES } from "@/registry/themes"

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** e.g. "Nova shadcn preset · Blue, Inter (b1FQfDVOC)" */
function presetTitle(preset: ResolvedPreset, label: string): string {
  const style =
    STYLES.find((s) => s.name === preset.style)?.title ??
    titleCase(preset.style)
  const theme =
    THEMES.find((t) => t.name === preset.theme)?.title ??
    titleCase(preset.theme)

  return `${style} ${label} · ${theme}, ${getFontDisplayName(preset.font)} (${preset.code})`
}

export function presetPageTitle(preset: ResolvedPreset): string {
  return presetTitle(preset, "shadcn preset")
}

export function presetDetailsPageTitle(preset: ResolvedPreset): string {
  return presetTitle(preset, "shadcn preset details")
}

export function presetMetaDescription(preset: ResolvedPreset): string {
  return `Preview this shadcn/ui preset (${preset.code}): ${preset.style} style, ${preset.baseColor} base, ${preset.theme} theme, ${preset.font} body, ${preset.radius} radius. Copy the code, open in create, or share.`
}

export function presetDnaMetaDescription(preset: ResolvedPreset): string {
  const headingFont = effectiveHeadingFont(preset.font, preset.fontHeading)

  return `A shadcn preset featuring the ${preset.style} style, a ${preset.baseColor} base, ${preset.theme} theme, ${preset.effectiveChartColor} charts, and ${getFontDisplayName(preset.font)} body text paired with ${getFontDisplayName(headingFont)} headings.`
}
