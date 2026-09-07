import { formatPresetCardDescription } from "@/lib/preset-card-description"
import type { PresetPageItem } from "@/lib/preset-catalog"

export type PresetSidebarItem = {
  code: string
  title: string
  description: string
}

export function toPresetSidebarItem(item: PresetPageItem): PresetSidebarItem {
  return {
    code: item.code,
    title: item.code,
    description: formatPresetCardDescription({
      style: item.config.style,
      baseColor: item.config.baseColor,
      theme: item.config.theme,
      chartColor: item.config.chartColor,
      iconLibrary: item.config.iconLibrary,
      font: item.config.font,
      fontHeading: item.config.fontHeading,
    }),
  }
}
