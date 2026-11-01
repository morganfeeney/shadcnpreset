/**
 * A custom preset shown in a preview frame: the frame paints its saved colours
 * first, then takes the editor's colours as they change, without reloading.
 */

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
