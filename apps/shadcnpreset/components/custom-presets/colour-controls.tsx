"use client"

import * as React from "react"
import { formatHex, parse } from "culori"
import { PlusIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BRAND_TOKENS,
  isUsableColour,
  type BrandToken,
} from "@/lib/brand-theme"
import type { CustomColours } from "@/lib/custom-colours"

/** The list value that means "my own colour" in a colour picker. */
export const CUSTOM = "custom"

export type SwatchItem = { value: string; label: string; swatch: string }

/**
 * One of shadcn create's colour pickers: its list, plus "Custom", which opens
 * a field for one exact colour.
 */
export function ColourPicker({
  label,
  items,
  value,
  custom,
  disabled,
  onPick,
  onCustom,
}: {
  label: string
  items: SwatchItem[]
  /** The list choice in use, ignored while a custom colour is set. */
  value: string
  custom: string | undefined
  disabled: boolean
  onPick: (value: string) => void
  /** `settle` is false while a picker is still being dragged. */
  onCustom: (colour: string, settle: boolean) => void
}) {
  const options = [
    ...items,
    { value: CUSTOM, label: "Custom", swatch: custom ?? "" },
  ]
  const current = custom ? CUSTOM : value
  const swatch = options.find((item) => item.value === current)?.swatch

  return (
    <div className="grid content-start gap-1.5 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      <Select
        items={options}
        value={current}
        disabled={disabled}
        onValueChange={(next: string | null) => {
          if (!next || next === current) return
          if (next === CUSTOM) onCustom(swatch || "#808080", true)
          else onPick(next)
        }}
      >
        <SelectTrigger aria-label={label} className="w-full bg-background">
          {swatch ? <Swatch colour={swatch} /> : null}
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {options.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.swatch ? <Swatch colour={item.swatch} /> : null}
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {custom ? (
        <ColourField
          label={`${label} colour`}
          colour={custom}
          disabled={disabled}
          onChange={onCustom}
        />
      ) : null}
    </div>
  )
}

function Swatch({ colour }: { colour: string }) {
  return (
    <span
      aria-hidden
      className="size-3.5 shrink-0 rounded-full border"
      style={{ background: colour }}
    />
  )
}

/**
 * One exact colour: picked from the system picker, or typed as any CSS
 * colour (oklch included). What is typed only counts once it is a colour.
 */
export function ColourField({
  label,
  colour,
  disabled,
  onChange,
}: {
  label: string
  colour: string
  disabled: boolean
  onChange: (colour: string, settle: boolean) => void
}) {
  const [draft, setDraft] = React.useState(colour)
  const [synced, setSynced] = React.useState(colour)
  if (colour !== synced) {
    setSynced(colour)
    setDraft(colour)
  }

  function commit() {
    const value = draft.trim()
    if (value === colour) return
    if (isUsableColour(value)) onChange(value, true)
    else setDraft(colour)
  }

  const parsed = parse(colour)

  return (
    <div className="flex items-center gap-1.5">
      <label
        className="relative size-8 shrink-0 cursor-pointer overflow-hidden rounded-md border has-disabled:cursor-default"
        style={{ background: colour }}
      >
        <span className="sr-only">Pick {label}</span>
        <input
          type="color"
          value={parsed ? formatHex(parsed) : "#000000"}
          disabled={disabled}
          className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-default"
          onInput={(event) => onChange(event.currentTarget.value, false)}
          onChange={(event) => onChange(event.currentTarget.value, true)}
        />
      </label>
      <Input
        aria-label={label}
        value={draft}
        disabled={disabled}
        spellCheck={false}
        className="h-8 min-w-0 flex-1 font-mono text-xs text-foreground"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit()
        }}
      />
    </div>
  )
}

function tokenLabel(token: BrandToken) {
  const [owner, part] = token.split("-")
  return part
    ? `Text on ${owner}`
    : owner.charAt(0).toUpperCase() + owner.slice(1)
}

/**
 * Single colours set by hand, over whatever the pickers give. For when one
 * token has to be exact; the pickers do the rest.
 */
export function ColourOverrides({
  overrides,
  current,
  disabled,
  onChange,
}: {
  overrides: CustomColours["overrides"]
  /** Each token's colour as the preview shows it, to start an override from. */
  current: Record<string, string>
  disabled: boolean
  onChange: (overrides: CustomColours["overrides"], settle: boolean) => void
}) {
  const set = Object.keys(overrides) as BrandToken[]
  const unset = BRAND_TOKENS.filter((token) => !overrides[token])

  function replace(from: BrandToken, to: BrandToken) {
    const next: CustomColours["overrides"] = {}
    for (const token of set) {
      next[token === from ? to : token] = overrides[token]
    }
    onChange(next, true)
  }

  return (
    <section aria-label="Override colours" className="grid grid-cols-1 gap-2">
      <div className="grid grid-cols-1 gap-0.5">
        <h2 className="text-xs font-medium text-muted-foreground">
          Override colours
        </h2>
        {set.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            The pickers set every colour. Override one when it has to be exact.
          </p>
        ) : null}
      </div>
      {set.length ? (
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {set.map((token) => (
            <li
              key={token}
              className="flex items-center gap-1.5 rounded-lg border bg-background p-1.5"
            >
              <Select
                items={[token, ...unset].map((value) => ({
                  value,
                  label: tokenLabel(value),
                }))}
                value={token}
                disabled={disabled}
                onValueChange={(next: string | null) => {
                  if (next && next !== token) replace(token, next as BrandToken)
                }}
              >
                <SelectTrigger
                  aria-label={`${tokenLabel(token)} override`}
                  className="h-8 w-36 shrink-0 bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {[token, ...unset].map((value) => (
                    <SelectItem key={value} value={value}>
                      {tokenLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="min-w-0 flex-1">
                <ColourField
                  label={`${tokenLabel(token)} colour`}
                  colour={overrides[token] ?? ""}
                  disabled={disabled}
                  onChange={(colour, settle) =>
                    onChange({ ...overrides, [token]: colour }, settle)
                  }
                />
              </div>
              {!disabled ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${tokenLabel(token)} override`}
                  onClick={() => {
                    const next = { ...overrides }
                    delete next[token]
                    onChange(next, true)
                  }}
                >
                  <XIcon />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {!disabled && unset.length ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => {
            const token = unset[0]
            onChange(
              { ...overrides, [token]: current[token] ?? "#808080" },
              true
            )
          }}
        >
          <PlusIcon data-icon="inline-start" />
          Override a colour
        </Button>
      ) : null}
    </section>
  )
}
