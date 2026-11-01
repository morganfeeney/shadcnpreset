"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import { PresetFontLoader } from "@/components/preset-font-loader"
import { PresetThemeSurface } from "@/components/preset-theme-surface"
import { ClaimableBalance } from "@/components/preset-swatch/components/cards/claimable-balance"
import { FeedbackForm } from "@/components/preset-swatch/components/cards/feedback-form"
import { ObservabilityCard } from "@/components/preset-swatch/components/cards/observability-card"
import { PieChartCard } from "@/components/preset-swatch/components/cards/pie-chart-card"
import { PreviewAnalyticsCard } from "@/components/preset-swatch/components/cards/preview-analytics-card"
import { SavingsProgress } from "@/components/preset-swatch/components/cards/savings-progress"
import { UIElements } from "@/components/preset-swatch/components/cards/ui-elements"
import {
  ColourOverrides,
  ColourPicker,
  type SwatchItem,
} from "@/components/custom-presets/colour-controls"
import { useSurfaceMode } from "@/components/themes/theme-surface"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import type { CustomColours, CustomSlot } from "@/lib/custom-colours"
import {
  buildCustomPreset,
  CUSTOM_PRESET_COLOUR_FACETS,
  CUSTOM_PRESET_FACETS,
  customPresetRegistryPath,
  facetValueLabel,
  installablePresetCode,
  withFacet,
  type CustomPreset,
  type CustomPresetFacet,
} from "@/lib/custom-preset"
import { trackEvent } from "@/lib/analytics-events"
import { cn } from "@/lib/utils"
import { BASE_COLORS } from "@/registry/base-colors"
import { THEMES } from "@/registry/themes"

const SHADCN = process.env.NEXT_PUBLIC_RC ? "shadcn@rc" : "shadcn@latest"

/** How long a dragged picker rests before its colour is saved. */
const SAVE_DELAY_MS = 400

type Draft = { code: string; colours: CustomColours }

/**
 * A custom preset: its colours and the preset's facets to change, a preview
 * in its style and fonts, and how to install it. Changes save as they are
 * made, so the install link always gives what is on screen; only the person
 * who made it can change anything.
 */
export function CustomPresetEditor({
  id,
  initialCode,
  colours: initialColours,
  canEdit,
  origin,
  embedded = false,
}: {
  id: string
  initialCode: string
  colours: CustomColours
  canEdit: boolean
  origin: string
  /** In the assistant's panel, whose own header names it: no page heading. */
  embedded?: boolean
}) {
  const [draft, setDraft] = React.useState<Draft>({
    code: initialCode,
    colours: initialColours,
  })
  const { code, colours } = draft
  const preset = React.useMemo(
    () => buildCustomPreset(code, colours),
    [code, colours]
  )

  // What the server last accepted, to go back to when a save fails.
  const saved = React.useRef(draft)
  const pendingSave = React.useRef<number | undefined>(undefined)
  React.useEffect(() => () => window.clearTimeout(pendingSave.current), [])

  function update(next: Draft, settle = true) {
    setDraft(next)
    window.clearTimeout(pendingSave.current)
    // A picker being dragged waits; anything else saves at once.
    if (settle) void save(next)
    else
      pendingSave.current = window.setTimeout(
        () => void save(next),
        SAVE_DELAY_MS
      )
  }

  async function save(next: Draft) {
    const response = await fetch(`/api/custom-presets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presetCode: next.code, colours: next.colours }),
    }).catch(() => null)
    if (response?.ok) {
      saved.current = next
      return
    }
    setDraft(saved.current)
    toast.error("That change didn’t save. Try again in a moment.")
  }

  function change(facet: CustomPresetFacet, value: string) {
    const next = withFacet(code, facet, value)
    if (!next || next === code) return
    trackEvent("custom_preset_change", { facet, value })
    update({ code: next, colours })
  }

  /** A list choice in a colour picker, which drops that picker's custom colour. */
  function pickColour(slot: CustomSlot, value: string) {
    const next = withFacet(code, slot, value) ?? code
    trackEvent("custom_preset_change", { facet: slot, value })
    update({ code: next, colours: { ...colours, [slot]: undefined } })
  }

  function customColour(slot: CustomSlot, colour: string, settle: boolean) {
    if (settle)
      trackEvent("custom_preset_change", { facet: slot, value: "custom" })
    update({ code, colours: { ...colours, [slot]: colour } }, settle)
  }

  if (!preset) return null
  const { resolved, colours: theme } = preset
  const radiusLocked = resolved.style === "lyra"
  const listValue: Record<CustomSlot, string> = {
    baseColor: resolved.baseColor,
    theme: resolved.theme,
    chartColor: resolved.effectiveChartColor,
  }

  return (
    <div
      className={
        embedded ? "grid grid-cols-1 gap-8" : "grid grid-cols-1 gap-12"
      }
    >
      {embedded ? null : (
        <header className="grid max-w-3xl gap-4">
          <h1 className="text-4xl font-semibold tracking-tight">
            Your custom preset
          </h1>
          <p className="text-muted-foreground">
            Started from preset <code className="font-mono">{initialCode}</code>
            , with your colours in place of its own. Light and dark, with every
            text colour checked for contrast.
          </p>
        </header>
      )}

      <section aria-label="Preset" className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {CUSTOM_PRESET_COLOUR_FACETS.map(({ key, label }) => (
            <ColourPicker
              key={key}
              label={label}
              items={colourItems(key, resolved.baseColor)}
              value={listValue[key]}
              custom={colours[key]}
              disabled={!canEdit}
              onPick={(value) => pickColour(key, value)}
              onCustom={(colour, settle) => customColour(key, colour, settle)}
            />
          ))}
          {CUSTOM_PRESET_FACETS.map(({ key, label, values }) => {
            // Lyra is square whatever radius it holds, as the create page
            // shows it: the radius it renders with, and no other choice.
            const locked = key === "radius" && radiusLocked
            return (
              <FacetSelect
                key={key}
                label={label}
                value={locked ? resolved.effectiveRadius : resolved[key]}
                items={values.map((value) => ({
                  value,
                  label: facetValueLabel(key, value),
                }))}
                disabled={!canEdit || locked}
                onChange={(value) => change(key, value)}
              />
            )
          })}
        </div>
        <ColourOverrides
          overrides={colours.overrides}
          current={theme.light}
          disabled={!canEdit}
          onChange={(overrides, settle) => {
            if (settle)
              trackEvent("custom_preset_change", { facet: "overrides" })
            update({ code, colours: { ...colours, overrides } }, settle)
          }}
        />
        <p className="text-sm text-muted-foreground">
          {canEdit
            ? "Change anything. Your colours stay, and the preview follows."
            : "Only the person who made this preset can change it."}
          {radiusLocked
            ? " Lyra is always square, so its radius is fixed."
            : null}
        </p>
      </section>

      {theme.adjustments.length || theme.lowContrast.length ? (
        <section aria-label="Notes" className="grid grid-cols-1 gap-1 text-sm">
          {theme.adjustments.map((note) => (
            <p key={note}>{note}</p>
          ))}
          {theme.lowContrast.map(({ mode, pair, ratio }) => (
            <p key={`${mode}-${pair}`} className="text-muted-foreground">
              Your overrides put {pair} at {ratio}:1 in {mode} mode, below the
              4.5:1 body text needs. Kept as you set them.
            </p>
          ))}
        </section>
      ) : null}

      <CustomPresetShowcase preset={preset} />

      <CustomPresetInstall
        code={installablePresetCode(code)}
        css={preset.css}
        registryUrl={`${origin}${customPresetRegistryPath(id)}`}
        summary={[
          facetValueLabel("style", resolved.style),
          facetValueLabel("font", resolved.font),
          facetValueLabel("iconLibrary", resolved.iconLibrary),
        ]}
      />
    </div>
  )
}

function FacetSelect({
  label,
  value,
  items,
  disabled,
  onChange,
}: {
  label: string
  value: string
  items: { value: string; label: string }[]
  disabled: boolean
  onChange: (value: string) => void
}) {
  return (
    <label className="grid content-start gap-1.5 text-xs font-medium text-muted-foreground">
      {label}
      <Select
        items={items}
        value={value}
        disabled={disabled}
        onValueChange={(next: string | null) => {
          if (next) onChange(next)
        }}
      >
        <SelectTrigger aria-label={label} className="w-full bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}

/** The preset's style, fonts and icons, in its colours, in the site's mode. */
function CustomPresetShowcase({ preset }: { preset: CustomPreset }) {
  const mode = useSurfaceMode()
  const { resolved, registryTheme } = preset
  if (!mode) {
    return (
      <div
        aria-hidden
        className="min-h-[40rem] animate-pulse rounded-2xl bg-muted"
      />
    )
  }

  return (
    <PresetThemeSurface
      registryTheme={registryTheme}
      surfaceMode={mode}
      bodyFont={resolved.font}
      headingFont={resolved.fontHeading}
      styleName={resolved.style}
      className="rounded-2xl border bg-muted p-4 text-foreground md:p-6 dark:bg-background"
    >
      <PresetFontLoader fontValues={[resolved.font, resolved.fontHeading]} />
      <section
        aria-label="Your custom preset on example components"
        className="columns-1 gap-4 *:mb-4 *:break-inside-avoid md:columns-2 xl:columns-3"
      >
        <PreviewAnalyticsCard />
        <UIElements />
        <FeedbackForm />
        <PieChartCard />
        <SavingsProgress />
        <ClaimableBalance />
        <ObservabilityCard iconLibrary={resolved.iconLibrary} />
      </section>
    </PresetThemeSurface>
  )
}

/**
 * Two steps: the preset itself (a preset code holds everything but exact
 * colours), then the colours from this preset's registry item.
 */
function CustomPresetInstall({
  code,
  css,
  registryUrl,
  summary,
}: {
  code: string
  css: string
  registryUrl: string
  summary: string[]
}) {
  return (
    <section className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 gap-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">
          Install this preset
        </h2>
        <p className="text-sm text-muted-foreground">
          The whole preset: {summary.join(", ")}, its radius, and your colours.
          Free.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <h3 className="font-medium">1. Set up the preset</h3>
        <p className="text-sm text-muted-foreground">
          The preset code holds everything but your custom colours, so this
          installs the preset as shadcn has it. Step 2 adds your colours.
        </p>
        <Tabs defaultValue="new">
          <TabsList>
            <TabsTrigger value="new">New project</TabsTrigger>
            <TabsTrigger value="existing">Existing project</TabsTrigger>
          </TabsList>
          <TabsContent value="new">
            <CopyableCode label="Copy the new project command">
              {`npx ${SHADCN} init --preset ${code}`}
            </CopyableCode>
          </TabsContent>
          <TabsContent value="existing">
            <CopyableCode label="Copy the existing project command">
              {`npx ${SHADCN} apply --preset ${code}`}
            </CopyableCode>
          </TabsContent>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <h3 className="font-medium">2. Add your colours</h3>
        <p className="text-sm text-muted-foreground">
          A preset code can’t hold exact colours, so they install from this
          link. Anyone with it can use them.
        </p>
        <CopyableCode label="Copy the colours command">
          {`npx ${SHADCN} add ${registryUrl}`}
        </CopyableCode>
      </div>

      <details className="grid grid-cols-1 gap-2">
        <summary className="cursor-pointer text-sm font-medium">
          Colours only, as CSS
        </summary>
        <p className="pt-2 text-sm text-muted-foreground">
          Already on this preset? Replace the <code>:root</code> and{" "}
          <code>.dark</code> blocks in your <code>globals.css</code>.
        </p>
        <CopyableCode label="Copy the CSS" block className="mt-2">
          {css}
        </CopyableCode>
      </details>
    </section>
  )
}

/**
 * Code to copy, with its copy button in the corner: a one-line command, or
 * (`block`) a stylesheet that scrolls.
 */
function CopyableCode({
  children,
  label,
  block = false,
  className,
}: {
  children: string
  label: string
  block?: boolean
  className?: string
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard()
  return (
    <div className={cn("relative", className)}>
      <pre
        className={cn(
          "overflow-x-auto rounded-xl border bg-muted/40 p-4 pr-14 font-mono",
          block ? "max-h-96 overflow-y-auto text-xs leading-relaxed" : "text-sm"
        )}
      >
        {children}
      </pre>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground"
        aria-label={isCopied ? "Copied" : label}
        onClick={() => void copyToClipboard(children)}
      >
        {isCopied ? (
          <CheckIcon aria-hidden className="size-4" />
        ) : (
          <CopyIcon aria-hidden className="size-4" />
        )}
      </Button>
    </div>
  )
}

const BASE_NAMES = new Set<string>(BASE_COLORS.map((base) => base.name))

/**
 * A colour picker's list, as shadcn create offers it: the base colours, or
 * the themes that go with the base (its own, plus every coloured one).
 */
function colourItems(slot: CustomSlot, baseColor: string): SwatchItem[] {
  const themes =
    slot === "baseColor"
      ? BASE_COLORS
      : THEMES.filter(
          (theme) => theme.name === baseColor || !BASE_NAMES.has(theme.name)
        )
  return themes.map((theme) => {
    const light = theme.cssVars?.light as Record<string, string>
    return {
      value: theme.name,
      label: facetValueLabel("theme", theme.name),
      swatch: slot === "baseColor" ? light["muted-foreground"] : light.primary,
    }
  })
}
