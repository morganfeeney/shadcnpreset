import {
  DEFAULT_PRESET_CONFIG,
  decodePreset,
  encodePreset,
  type PresetConfig,
} from "shadcn/preset"

import {
  buildCustomTheme,
  type CustomColours,
  type CustomTheme,
} from "@/lib/custom-colours"
import { getFontDefinition } from "@/lib/font-definitions"
import { resolvePresetFromCode, type ResolvedPreset } from "@/lib/preset"
import { PRESET_FILTER_OPTIONS } from "@/lib/preset-catalog"
import {
  formatCssBlock,
  getPresetThemeCssBundle,
  type PresetThemeCssBundle,
} from "@/lib/preset-theme-css"

type Vars = Record<string, string>

export type CustomPreset = {
  resolved: ResolvedPreset
  /** The preset's own theme with its custom colours in place of its own. */
  registryTheme: PresetThemeCssBundle["registryTheme"]
  colours: CustomTheme
  /** `:root` and `.dark` colour blocks, for pasting into `globals.css`. */
  css: string
}

/**
 * A preset with custom colours: everything a preset code holds (style, fonts,
 * icons, radius, and the list choices for any colour left uncustomised) comes
 * from `presetCode`. Pure, so the page can rebuild it as someone changes it.
 */
export function buildCustomPreset(
  presetCode: string,
  custom: CustomColours
): CustomPreset | null {
  const bundle = getPresetThemeCssBundle(presetCode)
  if (!bundle) return null

  const { registryTheme, resolved } = bundle
  const colours = buildCustomTheme(
    {
      ...resolved,
      radius: (registryTheme.cssVars.light as Vars).radius,
    },
    custom
  )

  return {
    resolved,
    registryTheme: {
      ...registryTheme,
      cssVars: {
        ...registryTheme.cssVars,
        light: colours.light,
        dark: colours.dark,
      },
    },
    colours,
    css: `${formatCssBlock(":root", colours.light)}\n\n${formatCssBlock(".dark", colours.dark)}`,
  }
}

/**
 * The colours as a shadcn registry item. `shadcn add <url>` writes them into
 * the project's `:root` and `.dark`, values as given, so it runs after the
 * preset itself is applied.
 */
export function customPresetRegistryItem(id: string, preset: CustomPreset) {
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: `custom-preset-${id}`,
    type: "registry:theme",
    cssVars: {
      light: coloursOnly(preset.colours.light),
      dark: coloursOnly(preset.colours.dark),
    },
  }
}

/**
 * The colour tokens without the radius: the preset installs that in step 1,
 * and `shadcn add` writes every var it is given, so a radius here would add
 * one to `.dark` that the project never had.
 */
function coloursOnly(vars: Vars): Vars {
  return Object.fromEntries(
    Object.entries(vars).filter(([key]) => key !== "radius")
  )
}

/** What a custom preset starts from before the assistant has picked one. */
export const DEFAULT_CUSTOM_PRESET_BASE = encodePreset(DEFAULT_PRESET_CONFIG)

/** The parts of a preset besides its colours, in shadcn create's order. */
export const CUSTOM_PRESET_FACETS = [
  { key: "style", label: "Style", values: PRESET_FILTER_OPTIONS.styles },
  { key: "font", label: "Font", values: PRESET_FILTER_OPTIONS.fonts },
  {
    key: "fontHeading",
    label: "Heading font",
    values: PRESET_FILTER_OPTIONS.fontHeadings,
  },
  {
    key: "iconLibrary",
    label: "Icons",
    values: PRESET_FILTER_OPTIONS.iconLibraries,
  },
  { key: "radius", label: "Radius", values: PRESET_FILTER_OPTIONS.radii },
] as const

/**
 * shadcn create's three colour pickers. Each also takes one custom colour,
 * which stands in for the list choice.
 */
export const CUSTOM_PRESET_COLOUR_FACETS = [
  {
    key: "baseColor",
    label: "Base Color",
    values: PRESET_FILTER_OPTIONS.baseColors,
  },
  { key: "theme", label: "Theme", values: PRESET_FILTER_OPTIONS.themes },
  {
    key: "chartColor",
    label: "Chart Color",
    values: PRESET_FILTER_OPTIONS.themes,
  },
] as const

export type CustomPresetFacet =
  | (typeof CUSTOM_PRESET_FACETS)[number]["key"]
  | (typeof CUSTOM_PRESET_COLOUR_FACETS)[number]["key"]

/** `code` with one facet changed, or null if that makes no valid preset. */
export function withFacet(
  code: string,
  facet: CustomPresetFacet,
  value: string
): string | null {
  // Encoding swaps a value it does not know for a default, so check first.
  const values: readonly string[] =
    [...CUSTOM_PRESET_FACETS, ...CUSTOM_PRESET_COLOUR_FACETS].find(
      ({ key }) => key === facet
    )?.values ?? []
  if (!values.includes(value)) return null
  const decoded = decodePreset(code)
  if (!decoded) return null
  const next = encodePreset(
    installableConfig({ ...decoded, [facet]: value } as PresetConfig)
  )
  return resolvePresetFromCode(next) ? next : null
}

const BASE_NAMES = new Set<string>(PRESET_FILTER_OPTIONS.baseColors)

/**
 * shadcn only takes a neutral Theme or Chart Color that is the base colour's
 * own ("zinc" on a zinc base, never "neutral"), and refuses the install
 * otherwise. A neutral left over from the previous base follows the new one,
 * as shadcn create does when the base changes.
 */
function installableConfig(config: PresetConfig): PresetConfig {
  const own = (value: string | undefined) =>
    value && BASE_NAMES.has(value) && value !== config.baseColor
      ? config.baseColor
      : value
  return {
    ...config,
    theme: own(config.theme) as PresetConfig["theme"],
    chartColor: own(config.chartColor) as PresetConfig["chartColor"],
  }
}

/**
 * `code` as shadcn's install will take it. Codes saved before the base colour
 * rule was kept here can hold a neutral from an earlier base; this mends them.
 */
export function installablePresetCode(code: string): string {
  const decoded = decodePreset(code)
  if (!decoded) return code
  const next = encodePreset(installableConfig(decoded))
  return resolvePresetFromCode(next) ? next : code
}

export function facetValueLabel(facet: CustomPresetFacet, value: string) {
  if (value === "inherit") return "Same as font"
  if (facet === "font" || facet === "fontHeading") {
    return getFontDefinition(value)?.title ?? value
  }
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** Where the colours install from, for the `shadcn add` command. */
export function customPresetRegistryPath(id: string) {
  return `/r/custom/${id}.json`
}

export function customPresetPath(id: string) {
  return `/custom-presets/${id}`
}
