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

export const PREVIEW_READY_MESSAGE_TYPE = "shadcnpreset:preview-ready"

/**
 * Sent by a preview frame once it listens for the messages above, so the
 * page sends them then rather than guessing when it has loaded.
 */
export type PreviewReadyMessage = { type: typeof PREVIEW_READY_MESSAGE_TYPE }

export function isPreviewReadyMessage(
  value: unknown
): value is PreviewReadyMessage {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    (value as Record<string, unknown>).type === PREVIEW_READY_MESSAGE_TYPE
  )
}
