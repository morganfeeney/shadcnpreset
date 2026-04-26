import {
  PRESET_BASE_COLORS,
  PRESET_FONT_HEADINGS,
  PRESET_FONTS,
  PRESET_ICON_LIBRARIES,
  PRESET_MENU_ACCENTS,
  PRESET_MENU_COLORS,
  PRESET_RADII,
  PRESET_STYLES,
  PRESET_THEMES,
  encodePreset,
  type PresetConfig,
} from "shadcn/preset"

function randomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getThemesForBaseColor(baseColor: PresetConfig["baseColor"]) {
  const baseColorNames = new Set<string>(PRESET_BASE_COLORS)

  return PRESET_THEMES.filter((theme) => {
    if (theme === baseColor) {
      return true
    }

    return !baseColorNames.has(theme)
  })
}

function isTranslucentMenuColor(menuColor: PresetConfig["menuColor"]) {
  return (
    menuColor === "default-translucent" || menuColor === "inverted-translucent"
  )
}

function getRandomFontHeading(font: PresetConfig["font"]) {
  if (Math.random() < 0.7) {
    return "inherit" as const
  }

  const headingOptions = PRESET_FONT_HEADINGS.filter(
    (option) => option !== "inherit" && option !== font
  )

  return randomItem(
    headingOptions.length ? headingOptions : PRESET_FONT_HEADINGS
  )
}

export function generateRandomCompatiblePreset() {
  const baseColor = randomItem(PRESET_BASE_COLORS)
  const availableThemes = getThemesForBaseColor(baseColor)
  const font = randomItem(PRESET_FONTS)
  const menuColor = randomItem(PRESET_MENU_COLORS)

  return encodePreset({
    style: randomItem(PRESET_STYLES),
    baseColor,
    theme: randomItem(availableThemes),
    chartColor: randomItem(availableThemes),
    iconLibrary: randomItem(PRESET_ICON_LIBRARIES),
    font,
    fontHeading: getRandomFontHeading(font),
    radius: randomItem(PRESET_RADII),
    menuAccent: isTranslucentMenuColor(menuColor)
      ? "subtle"
      : randomItem(PRESET_MENU_ACCENTS),
    menuColor,
  })
}
