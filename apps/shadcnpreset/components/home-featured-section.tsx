import { PresetIframeCard } from "@/components/preset-iframe-card"
import type { PresetPageItem } from "@/lib/preset-catalog"

type HomeFeaturedSectionProps = {
  items: PresetPageItem[]
}

export function HomeFeaturedSection({ items }: HomeFeaturedSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight md:text-xl">
        Featured presets
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
        {items.map((item) => (
          <li key={item.index}>
            <PresetIframeCard
              code={item.code}
              title={item.code}
              description={`${item.config.baseColor} base, ${item.config.iconLibrary} icons, ${item.config.font} body`}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
