"use client"

import * as React from "react"

import {
  ColourOverrides,
  ColourPicker,
  PropertyRow,
  type SwatchItem,
} from "@/components/custom-presets/colour-controls"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { trackEvent } from "@/lib/analytics-events"
import type { CustomColours, CustomSlot } from "@/lib/custom-colours"
import {
  buildCustomPreset,
  CUSTOM_PRESET_COLOUR_FACETS,
  CUSTOM_PRESET_FACETS,
  facetValueLabel,
  withFacet,
  type CustomPresetFacet,
} from "@/lib/custom-preset"
import { cn } from "@/lib/utils"
import { BASE_COLORS } from "@/registry/base-colors"
import { THEMES } from "@/registry/themes"

type CustomPresetValue = { code: string; colours: CustomColours }

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
 * Everything about a preset that can be changed, in sections: its colours,
 * its style and its type. Each change comes out as the whole preset as it
 * would stand; `settle` is false while a picker is still being dragged.
 */
function CustomPresetProperties({
  code,
  colours,
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  code: string
  colours: CustomColours
  onValueChange: (next: CustomPresetValue, settle: boolean) => void
}) {
  const preset = React.useMemo(
    () => buildCustomPreset(code, colours),
    [code, colours]
  )
  if (!preset) return null
  const { resolved, colours: theme } = preset
  const radiusLocked = resolved.style === "lyra"
  const listValue: Record<CustomSlot, string> = {
    baseColor: resolved.baseColor,
    theme: resolved.theme,
    chartColor: resolved.effectiveChartColor,
  }

  function change(facet: CustomPresetFacet, value: string) {
    const next = withFacet(code, facet, value)
    if (!next || next === code) return
    trackEvent("custom_preset_change", { facet, value })
    onValueChange({ code: next, colours }, true)
  }

  /** A list choice in a colour picker, which drops that picker's custom colour. */
  function pickColour(slot: CustomSlot, value: string) {
    const next = withFacet(code, slot, value) ?? code
    trackEvent("custom_preset_change", { facet: slot, value })
    onValueChange({ code: next, colours: { ...colours, [slot]: undefined } }, true)
  }

  function customColour(slot: CustomSlot, colour: string, settle: boolean) {
    if (settle)
      trackEvent("custom_preset_change", { facet: slot, value: "custom" })
    onValueChange({ code, colours: { ...colours, [slot]: colour } }, settle)
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
        disabled={locked}
        onChange={(value) => change(key, value)}
      />
    )
  }

  return (
    <div
      data-slot="custom-preset-properties"
      className={cn("text-sm", className)}
      {...props}
    >
      <PropertySection title="Colours">
        {CUSTOM_PRESET_COLOUR_FACETS.map(({ key, label }) => (
          <ColourPicker
            key={key}
            label={label.replace(" Color", "")}
            items={colourItems(key, resolved.baseColor)}
            value={listValue[key]}
            custom={colours[key]}
            onPick={(value) => pickColour(key, value)}
            onCustom={(colour, settle) => customColour(key, colour, settle)}
          />
        ))}
        <ColourOverrides
          overrides={colours.overrides}
          current={theme.light}
          onChange={(overrides, settle) => {
            if (settle)
              trackEvent("custom_preset_change", { facet: "overrides" })
            onValueChange({ code, colours: { ...colours, overrides } }, settle)
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
    </div>
  )
}

/** A labelled group; a label, not a heading, so the page's outline is its own. */
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
      <div className="text-xs font-semibold">{title}</div>
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

export { CustomPresetProperties }
