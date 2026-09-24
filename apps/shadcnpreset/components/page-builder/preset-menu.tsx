"use client"

import type * as React from "react"
import { HeartIcon, ShuffleIcon } from "@phosphor-icons/react"
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
import useVote from "@/hooks/use-vote"
import { getPresetSwatchPair } from "@/lib/oklch-swatch"
import { resolvePresetFromCode } from "@/lib/preset"
import { formatPresetCardDescription } from "@/lib/preset-card-description"
import { generateRandomCompatiblePreset } from "@/lib/random-preset"

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
      {/* As tall as the title's line (text-sm), so the dot centres on the title. */}
      <span className="flex h-5 shrink-0 items-center">
        <PresetSwatch swatch={option.swatch} />
      </span>
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
 * anything), whatever was shuffled, and the visitor's saved presets — with a
 * shuffle and a save beside it. A preset picked here sticks across new
 * descriptions: the page changes, the theme does not. Picking Jev's own
 * hands the choice back.
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
      <SaveButton code={current} />
    </div>
  )
}

/**
 * Saves the preset on the page — a shuffle worth keeping, say — as a vote,
 * which is what a saved preset is. Signed out, it asks the visitor to sign
 * in and saves once they have. A saved preset joins the menu's Saved group.
 */
function SaveButton({ code }: { code: string }) {
  const { toggleVote, hasVoted, isVoting } = useVote(code)
  const label = hasVoted ? "Remove from saved presets" : "Save preset"
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      aria-pressed={hasVoted}
      title={label}
      disabled={isVoting}
      onClick={() => void toggleVote()}
    >
      <HeartIcon weight={hasVoted ? "fill" : "regular"} />
    </Button>
  )
}
