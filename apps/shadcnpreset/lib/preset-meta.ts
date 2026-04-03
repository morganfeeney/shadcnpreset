import type { ResolvedPreset } from "@/lib/preset"

export function presetMetaDescription(preset: ResolvedPreset): string {
  return `Preview this shadcn/ui preset (${preset.code}): ${preset.style} style, ${preset.baseColor} base, ${preset.theme} theme, ${preset.font} body, ${preset.radius} radius. Copy the code, open in create, or share.`
}
