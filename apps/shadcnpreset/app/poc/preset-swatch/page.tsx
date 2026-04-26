import { encodePreset } from "shadcn/preset"

import { PresetFontLoader } from "@/components/preset-font-loader"
import { PresetSwatchPoc } from "@/components/preset-swatch-poc"
import { getHomepageFeed } from "@/lib/preset-feed"
import { PresetCard } from "@/app/poc/preset-swatch/components/preset-card"
import { PresetCard1 } from "@/app/poc/preset-swatch/components/preset-card-1"
import { PresetCard1StyleOverview } from "@/app/poc/preset-swatch/components/preset-card-1-style-overview"

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
          and fonts directly to a local swatch UI. No v4 iframe bridge needed
          for that part.
        </p>
      </div>
      {homepagePresets[0] ? (
        <section className="mb-8 space-y-2">
          <h2 className="text-lg font-semibold">Preset-styled card (local)</h2>
          <p className="text-sm text-muted-foreground">
            One card: decoded preset config,{" "}
            <code className="rounded bg-muted px-1">buildRegistryTheme</code>,
            and the same PoC components as the grid below (
            <code className="rounded bg-muted px-1">
              TypographySpecimenCard
            </code>
            , <code className="rounded bg-muted px-1">ColorSpecimen</code>,{" "}
            <code className="rounded bg-muted px-1">Card</code> /{" "}
            <code className="rounded bg-muted px-1">Button</code>
            ). No iframe.
          </p>
          <div className="max-w-2xl space-y-6">
            <PresetCard1 initialCode={homepagePresets[0].code} />
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">
                Style Overview variant
              </h3>
              <p className="text-sm text-muted-foreground">
                Same header + random control; body uses the v4 example Style
                Overview (token swatch grid) instead of the typography swatch.
              </p>
              <PresetCard1StyleOverview initialCode={homepagePresets[0].code} />
            </div>
          </div>
        </section>
      ) : null}
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
