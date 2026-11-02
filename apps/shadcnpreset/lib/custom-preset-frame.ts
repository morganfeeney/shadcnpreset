/**
 * A custom preset shown in a preview frame: the frame paints its saved colours
 * first, then takes the editor's colours as they change, without reloading.
 */

/** The `<style>` in the frame that holds the preset's own theme. */
export const PRESET_THEME_STYLE_ID = "preset-preview-example-theme"

/** The `<style>` in the frame that holds the custom colours, after the preset's own. */
export const CUSTOM_COLOURS_STYLE_ID = "preset-preview-custom-colours"

export const CUSTOM_COLOURS_MESSAGE_TYPE = "shadcnpreset:custom-colours"

export type CustomColoursMessage = {
  type: typeof CUSTOM_COLOURS_MESSAGE_TYPE
  css: string
}

export function isCustomColoursMessage(
  value: unknown
): value is CustomColoursMessage {
  if (!value || typeof value !== "object") return false
  const candidate = value as Record<string, unknown>
  return (
    candidate.type === CUSTOM_COLOURS_MESSAGE_TYPE &&
    typeof candidate.css === "string"
  )
}

export const PRESET_CODE_MESSAGE_TYPE = "shadcnpreset:preset-code"

/**
 * A new preset code for the frame to show in place: its style, fonts and
 * icons change without loading the page again.
 */
export type PresetCodeMessage = {
  type: typeof PRESET_CODE_MESSAGE_TYPE
  code: string
}

export function isPresetCodeMessage(
  value: unknown
): value is PresetCodeMessage {
  if (!value || typeof value !== "object") return false
  const candidate = value as Record<string, unknown>
  return (
    candidate.type === PRESET_CODE_MESSAGE_TYPE &&
    typeof candidate.code === "string"
  )
}

/** The preview views a custom preset is shown in, in the toolbar's order. */
export const CUSTOM_PRESET_VIEWS = [
  { example: "preview", label: "View 1" },
  { example: "preview-02", label: "View 2" },
  { example: "dashboard", label: "Dashboard" },
] as const

export type CustomPresetView = (typeof CUSTOM_PRESET_VIEWS)[number]["example"]

export function customPresetPreviewSrc(
  view: CustomPresetView,
  presetCode: string,
  id: string
) {
  const query = new URLSearchParams({ preset: presetCode, custom: id })
  return `/preset-preview/${view}?${query}`
}
