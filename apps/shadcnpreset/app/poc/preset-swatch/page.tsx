import { encodePreset } from "shadcn/preset"

import { PresetFontLoader } from "@/components/preset-font-loader"
import { PresetSwatchPoc } from "@/components/preset-swatch-poc"
import { getHomepageFeed } from "@/lib/preset-feed"
import { PresetCard } from "@/app/poc/preset-swatch/components/preset-card"

export default async function PresetSwatchPocPage() {
  const defaultPresetCode = encodePreset({})
  const homepagePresets = await getHomepageFeed(8)
  const homepageFontValues = Array.from(
    new Set(
      homepagePresets.flatMap((item) => [
        item.config.font,
        item.config.fontHeading === "inherit"
          ? item.config.font
          : item.config.fontHeading,
      ])
    )
  )

  return (
    <main className="container py-8 md:py-10">
      <PresetFontLoader fontValues={homepageFontValues} />
      <div className="mb-6 space-y-2">
        <p className="text-sm text-muted-foreground">Proof of concept</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Preset Decode + Local Style Preview
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          This route decodes a preset code and applies style, colors, radius,
          and fonts directly to a local swatch UI. No v4 iframe bridge needed.
        </p>
      </div>
      <PresetSwatchPoc defaultCode={defaultPresetCode} />
      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">
          Homepage presets as decoded PoC cards
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {homepagePresets.map((item) => (
            <PresetCard key={item.code} item={item} />
          ))}
        </div>
      </section>
    </main>
  )
}
