import { decodePreset, encodePreset, isPresetCode } from "shadcn/preset"

/** True only for the single canonical encoding for a preset (what `encodePreset` emits). */
export function isCanonicalPresetCode(code: string): boolean {
  if (!isPresetCode(code)) return false
  const decoded = decodePreset(code)
  if (!decoded) return false
  return encodePreset(decoded) === code
}
