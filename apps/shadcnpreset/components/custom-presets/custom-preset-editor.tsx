"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "@phosphor-icons/react"
import { ChevronDownIcon, LinkIcon } from "lucide-react"
import { toast } from "sonner"

import {
  ColourOverrides,
  ColourPicker,
  PropertyRow,
  type SwatchItem,
} from "@/components/custom-presets/colour-controls"
import { PresetV4Frame } from "@/components/preset-v4-frame"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import type { CustomColours, CustomSlot } from "@/lib/custom-colours"
import {
  buildCustomPreset,
  CUSTOM_PRESET_COLOUR_FACETS,
  CUSTOM_PRESET_FACETS,
  customPresetPath,
  customPresetRegistryPath,
  facetValueLabel,
  installablePresetCode,
  withFacet,
  type CustomPresetFacet,
} from "@/lib/custom-preset"
import {
  CUSTOM_PRESET_VIEWS,
  customPresetPreviewSrc,
  type CustomPresetView,
} from "@/lib/custom-preset-frame"
import { trackEvent } from "@/lib/analytics-events"
import { cn } from "@/lib/utils"
import { BASE_COLORS } from "@/registry/base-colors"
import { THEMES } from "@/registry/themes"

const SHADCN = process.env.NEXT_PUBLIC_RC ? "shadcn@rc" : "shadcn@latest"

/** How long a dragged picker rests before its colour is saved. */
const SAVE_DELAY_MS = 400

type Draft = { code: string; colours: CustomColours }

const FACET_LABEL: Record<
  (typeof CUSTOM_PRESET_FACETS)[number]["key"],
  string
> = {
  style: "Style",
  radius: "Radius",
  iconLibrary: "Icons",
  font: "Font",
  fontHeading: "Headings",
}

/**
 * A custom preset to work on: create's preview in its colours, and a column
 * of everything to change beside it. Changes save as they are made, so the
 * install link always gives what is on screen; only the person who made it
 * can change anything. `start` and `end` go either side of its bar, for the
 * panel's way back to the chat and its close button.
 */
export function CustomPresetEditor({
  id,
  initialCode,
  colours: initialColours,
  canEdit,
  origin,
  start,
  end,
}: {
  id: string
  initialCode: string
  colours: CustomColours
  canEdit: boolean
  origin: string
  start?: React.ReactNode
  end?: React.ReactNode
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

  function facetSelect(key: (typeof CUSTOM_PRESET_FACETS)[number]["key"]) {
    const facet = CUSTOM_PRESET_FACETS.find((f) => f.key === key)!
    // Lyra is square whatever radius it holds, as the create page shows it:
    // the radius it renders with, and no other choice.
    const locked = key === "radius" && radiusLocked
    return (
      <FacetSelect
        key={key}
        label={FACET_LABEL[key]}
        value={locked ? resolved.effectiveRadius : resolved[key]}
        items={facet.values.map((value) => ({
          value,
          label: facetValueLabel(key, value),
        }))}
        disabled={!canEdit || locked}
        onChange={(value) => change(key, value)}
      />
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-2 lg:px-3">
        {start}
        <span
          aria-hidden
          className="size-3 shrink-0 rounded-sm"
          style={{ background: theme.light.primary }}
        />
        <h2 className="truncate text-sm font-semibold">
          {canEdit ? "Your custom preset" : "Custom preset"}
        </h2>
        <code className="hidden font-mono text-xs text-muted-foreground sm:inline">
          {code}
        </code>
        <span className="flex-1" />
        <ShareButton url={`${origin}${customPresetPath(id)}`} />
        <InstallMenu
          code={installablePresetCode(code)}
          css={preset.css}
          registryUrl={`${origin}${customPresetRegistryPath(id)}`}
        />
        {end}
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <PreviewCanvas
          id={id}
          code={code}
          layout={[
            resolved.style,
            resolved.font,
            resolved.fontHeading,
            resolved.iconLibrary,
          ].join(" ")}
          css={preset.css}
        />

        <aside
          aria-label="Customise"
          className="shrink-0 border-t text-sm lg:w-72 lg:overflow-y-auto lg:overscroll-contain lg:border-t-0 lg:border-l"
        >
          <PropertySection title="Colours">
            {CUSTOM_PRESET_COLOUR_FACETS.map(({ key, label }) => (
              <ColourPicker
                key={key}
                label={label.replace(" Color", "")}
                items={colourItems(key, resolved.baseColor)}
                value={listValue[key]}
                custom={colours[key]}
                disabled={!canEdit}
                onPick={(value) => pickColour(key, value)}
                onCustom={(colour, settle) => customColour(key, colour, settle)}
              />
            ))}
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
            {theme.adjustments.length || theme.lowContrast.length ? (
              <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                {theme.adjustments.map((note) => (
                  <p key={note}>{note}</p>
                ))}
                {theme.lowContrast.map(({ mode, pair, ratio }) => (
                  <p key={`${mode}-${pair}`}>
                    Your overrides put {pair} at {ratio}:1 in {mode} mode, below
                    the 4.5:1 body text needs. Kept as you set them.
                  </p>
                ))}
              </div>
            ) : null}
          </PropertySection>

          <PropertySection title="Style">
            {facetSelect("style")}
            {facetSelect("radius")}
            {facetSelect("iconLibrary")}
            {radiusLocked ? (
              <p className="text-xs text-muted-foreground">
                Lyra is always square, so its radius is fixed.
              </p>
            ) : null}
          </PropertySection>

          <PropertySection title="Typography">
            {facetSelect("font")}
            {facetSelect("fontHeading")}
          </PropertySection>

          {canEdit ? null : (
            <p className="px-4 pb-4 text-xs text-muted-foreground">
              Only the person who made this preset can change it.
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}

function PropertySection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      aria-label={title}
      className="grid grid-cols-1 gap-2.5 border-b px-4 py-4 last:border-b-0"
    >
      <h3 className="text-xs font-semibold">{title}</h3>
      {children}
    </section>
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
    <PropertyRow label={label}>
      <Select
        items={items}
        value={value}
        disabled={disabled}
        onValueChange={(next: string | null) => {
          if (next) onChange(next)
        }}
      >
        <SelectTrigger aria-label={label} size="sm" className="w-full">
          <SelectValue />
        </SelectTrigger>
        {/* Under the field, as every menu in the column opens: lining the
          chosen item up with it lifts a long list over the rows above. */}
        <SelectContent alignItemWithTrigger={false} className="max-h-72">
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </PropertyRow>
  )
}

/**
 * Create's preview of the preset. Only a change to its `layout` (the style,
 * fonts and icons, which the frame lays out from its code) reloads it; every
 * colour and the radius arrive as `css`, listed or custom alike, and repaint
 * it in place.
 */
function PreviewCanvas({
  id,
  code,
  layout,
  css,
}: {
  id: string
  code: string
  layout: string
  css: string
}) {
  const [view, setView] = React.useState<CustomPresetView>("preview")
  const [frame, setFrame] = React.useState({ code, layout })
  if (layout !== frame.layout) setFrame({ code, layout })
  const src = customPresetPreviewSrc(view, frame.code, id)
  // Shown once it has taken the site's mode, which arrives after it loads:
  // until then it paints light, a flash on every change of style or font.
  const [shownSrc, setShownSrc] = React.useState<string | null>(null)
  const shown = shownSrc === src

  return (
    <div className="relative h-[70svh] shrink-0 bg-muted p-3 lg:h-auto lg:min-h-0 lg:flex-1 lg:p-5">
      <PresetV4Frame
        src={src}
        title="Your custom preset in create's preview"
        customColoursCss={css}
        className={cn(
          "block size-full rounded-lg border bg-background shadow-lg transition-opacity duration-150",
          !shown && "opacity-0"
        )}
        onLoad={() => window.setTimeout(() => setShownSrc(src), 250)}
      />
      {shown ? null : (
        <div className="absolute inset-0 grid place-items-center">
          <Spinner />
        </div>
      )}
      <div
        role="toolbar"
        aria-label="Preview"
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-0.5 rounded-lg border bg-popover p-1 shadow-md lg:bottom-8"
      >
        {CUSTOM_PRESET_VIEWS.map(({ example, label }) => (
          <Button
            key={example}
            type="button"
            size="sm"
            variant={view === example ? "secondary" : "ghost"}
            aria-pressed={view === example}
            onClick={() => setView(example)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}

function ShareButton({ url }: { url: string }) {
  const { isCopied, copyToClipboard } = useCopyToClipboard()
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        void copyToClipboard(url)
        trackEvent("custom_preset_share", {})
      }}
    >
      {isCopied ? (
        <CheckIcon data-icon="inline-start" />
      ) : (
        <LinkIcon data-icon="inline-start" />
      )}
      {isCopied ? "Copied" : "Share"}
    </Button>
  )
}

/**
 * Two steps: the preset itself (a preset code holds everything but exact
 * colours), then the colours from this preset's registry item.
 */
function InstallMenu({
  code,
  css,
  registryUrl,
}: {
  code: string
  css: string
  registryUrl: string
}) {
  return (
    <Popover>
      <PopoverTrigger render={<Button type="button" size="sm" />}>
        Install
        <ChevronDownIcon data-icon="inline-end" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        aria-label="Install this preset"
        className="grid w-[min(28rem,calc(100vw-2rem))] grid-cols-1 gap-4 p-4"
      >
        <div className="grid grid-cols-1 gap-2">
          <h3 className="text-sm font-medium">1. Set up the preset</h3>
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
          <h3 className="text-sm font-medium">2. Add your colours</h3>
          <p className="text-xs text-muted-foreground">
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
          <p className="pt-2 text-xs text-muted-foreground">
            Already on this preset? Replace the <code>:root</code> and{" "}
            <code>.dark</code> blocks in your <code>globals.css</code>.
          </p>
          <CopyableCode label="Copy the CSS" block className="mt-2">
            {css}
          </CopyableCode>
        </details>
      </PopoverContent>
    </Popover>
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
          "overflow-x-auto rounded-lg border bg-muted/40 p-3 pr-12 font-mono text-xs",
          block && "max-h-72 overflow-y-auto leading-relaxed"
        )}
      >
        {children}
      </pre>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-foreground"
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
