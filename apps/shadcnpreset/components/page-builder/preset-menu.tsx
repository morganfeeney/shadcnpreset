"use client"

import type * as React from "react"
import { ShuffleIcon } from "@phosphor-icons/react"
import { DEFAULT_PRESET_CONFIG, encodePreset } from "shadcn/preset"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMyPresets } from "@/hooks/use-my-presets"
import { getPresetSwatchPair } from "@/lib/oklch-swatch"
import { resolvePresetFromCode } from "@/lib/preset"
import { formatPresetCardDescription } from "@/lib/preset-card-description"
import { generateRandomCompatiblePreset } from "@/lib/random-preset"
import { useAuthStore } from "@/stores/auth-store"

export const DEFAULT_PRESET = encodePreset(DEFAULT_PRESET_CONFIG)

type PresetOption = {
  value: string
  label: string
  description: string
  swatch: { light: string; dark: string }
}

function presetOption(code: string): PresetOption | null {
  const config = resolvePresetFromCode(code)
  if (!config) return null
  const style = config.style.charAt(0).toUpperCase() + config.style.slice(1)
  return {
    value: config.code,
    label: `${style} · ${config.baseColor} · ${config.theme}`,
    description: formatPresetCardDescription(config),
    swatch: getPresetSwatchPair(config, "primary"),
  }
}

function PresetSwatch({ swatch }: { swatch: PresetOption["swatch"] }) {
  return (
    <span
      aria-hidden
      className="size-2.5 shrink-0 rounded-full bg-(--swatch-light) ring-1 ring-border dark:bg-(--swatch-dark)"
      style={
        {
          "--swatch-light": swatch.light,
          "--swatch-dark": swatch.dark,
        } as React.CSSProperties
      }
    />
  )
}

function PresetOptionItem({ option }: { option: PresetOption }) {
  return (
    <SelectItem value={option.value}>
      <PresetSwatch swatch={option.swatch} />
      <span className="grid min-w-0">
        <span className="truncate">{option.label}</span>
        <span className="truncate text-xs text-muted-foreground">
          {option.description}
        </span>
      </span>
    </SelectItem>
  )
}

/**
 * The page's preset in one menu — Jev's (or the default before Jev has read
 * anything), whatever was shuffled, and the visitor's saved presets — and a
 * shuffle. A preset picked here sticks across new descriptions: the page
 * changes, the theme does not. Picking Jev's own hands the choice back.
 */
export function PresetMenu({
  jevCode,
  override,
  onOverride,
}: {
  jevCode: string | undefined
  override: string | undefined
  onOverride: (code: string | undefined) => void
}) {
  const authStatus = useAuthStore((state) => state.status)
  const ensureAuthenticated = useAuthStore((state) => state.ensureAuthenticated)
  const myPresets = useMyPresets()

  const baseCode = jevCode ?? DEFAULT_PRESET
  const current = override ?? baseCode
  const saved = (myPresets.data?.items ?? [])
    .map((item) => presetOption(item.code))
    .filter((option): option is PresetOption => option !== null)
  const suggested = [override, baseCode]
    .filter((code, i, all): code is string => !!code && all.indexOf(code) === i)
    .map(presetOption)
    .filter((option): option is PresetOption => option !== null)
    // A saved preset shows once, under Saved.
    .filter((option) => !saved.some((s) => s.value === option.value))
  const options = [...suggested, ...saved]
  const currentOption = options.find((option) => option.value === current)

  function pick(code: string) {
    onOverride(code === baseCode ? undefined : code)
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-1.5">
      <div className="flex min-w-0 gap-1.5">
        <Select
          items={options.map(({ value, label }) => ({ value, label }))}
          value={current}
          onValueChange={(code: string | null) => {
            if (code) pick(code)
          }}
        >
          <SelectTrigger
            aria-label="Preset"
            className="w-auto min-w-0 flex-1 bg-background"
          >
            {currentOption ? (
              <PresetSwatch swatch={currentOption.swatch} />
            ) : null}
            <SelectValue className="truncate" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {suggested.length ? (
              <SelectGroup>
                <SelectLabel>{jevCode ? "This page" : "Default"}</SelectLabel>
                {suggested.map((option) => (
                  <PresetOptionItem key={option.value} option={option} />
                ))}
              </SelectGroup>
            ) : null}
            {saved.length ? (
              <SelectGroup>
                <SelectLabel>Saved</SelectLabel>
                {saved.map((option) => (
                  <PresetOptionItem key={option.value} option={option} />
                ))}
              </SelectGroup>
            ) : null}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Shuffle preset"
          title="Shuffle preset"
          onClick={() => pick(generateRandomCompatiblePreset())}
        >
          <ShuffleIcon />
        </Button>
      </div>
      {authStatus === "anonymous" ? (
        <p className="text-xs text-muted-foreground">
          <button
            type="button"
            className="underline underline-offset-4 hover:text-foreground"
            onClick={() => void ensureAuthenticated()}
          >
            Sign in
          </button>{" "}
          to use presets you have saved.
        </p>
      ) : null}
    </div>
  )
}
