"use client"

import * as React from "react"
import { PlusIcon, XIcon } from "lucide-react"

import { OklchField } from "@/components/custom-presets/oklch-picker"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BRAND_TOKENS, type BrandToken } from "@/lib/brand-theme"
import type { CustomColours } from "@/lib/custom-colours"

/** The list value that means "my own colour" in a colour picker. */
export const CUSTOM = "custom"

export type SwatchItem = { value: string; label: string; swatch: string }

type OnCustom = (colour: string, settle: boolean) => void

/**
 * A label and its control, one row of the properties column. The label is
 * the control's name, so it reads the same to a screen reader.
 */
export function PropertyRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-1">{children}</div>
    </div>
  )
}

/**
 * One of shadcn create's colour pickers: its list, plus "Custom", which turns
 * it into one exact colour picked in OKLCH, until cleared back to the list.
 */
export function ColourPicker({
  label,
  items,
  value,
  custom,
  onPick,
  onCustom,
}: {
  label: string
  items: SwatchItem[]
  /** The list choice in use, ignored while a custom colour is set. */
  value: string
  custom: string | undefined
  onPick: (value: string) => void
  /** `settle` is false while a picker is still being dragged. */
  onCustom: OnCustom
}) {
  if (custom) {
    return (
      <PropertyRow label={label}>
        <OklchField
          label={`${label} colour`}
          colour={custom}
          onChange={onCustom}
          className="flex-1"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Use a listed ${label}`}
          onClick={() => onPick(value)}
        >
          <XIcon />
        </Button>
      </PropertyRow>
    )
  }

  const listed = items.find((item) => item.value === value)
  const options = [...items, { value: CUSTOM, label: "Custom…", swatch: "" }]
  return (
    <PropertyRow label={label}>
      <Select
        items={options}
        value={value}
        onValueChange={(next: string | null) => {
          if (!next || next === value) return
          // Custom starts from the listed colour, to move from there.
          if (next === CUSTOM) onCustom(listed?.swatch || "#808080", true)
          else onPick(next)
        }}
      >
        <SelectTrigger aria-label={label} size="sm" className="w-full">
          {listed ? <Swatch colour={listed.swatch} /> : null}
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} className="max-h-72">
          {options.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.swatch ? <Swatch colour={item.swatch} /> : null}
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </PropertyRow>
  )
}

function Swatch({ colour }: { colour: string }) {
  return (
    <span
      aria-hidden
      className="size-3.5 shrink-0 rounded-sm border"
      style={{ background: colour }}
    />
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
  onChange,
}: {
  overrides: CustomColours["overrides"]
  /** Each token's colour as the preview shows it, to start an override from. */
  current: Record<string, string>
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
    <div className="grid grid-cols-1 gap-2">
      <PropertyRow label="Overrides">
        <span className="flex h-7 min-w-0 flex-1 items-center rounded-md bg-muted px-2 text-xs text-muted-foreground">
          {set.length ? `${set.length} set` : "None"}
        </span>
        {unset.length ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Override a colour"
            onClick={() => {
              const token = unset[0]
              onChange(
                { ...overrides, [token]: current[token] ?? "#808080" },
                true
              )
            }}
          >
            <PlusIcon />
          </Button>
        ) : null}
      </PropertyRow>
      {set.length ? (
        <ul aria-label="Override colours" className="grid grid-cols-1 gap-1.5">
          {set.map((token) => (
            <li key={token} className="flex items-center gap-1">
              <Select
                items={[token, ...unset].map((value) => ({
                  value,
                  label: tokenLabel(value),
                }))}
                value={token}
                onValueChange={(next: string | null) => {
                  if (next && next !== token) replace(token, next as BrandToken)
                }}
              >
                <SelectTrigger
                  aria-label={`${tokenLabel(token)} override`}
                  size="sm"
                  className="w-20 shrink-0 text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  alignItemWithTrigger={false}
                  className="max-h-72"
                >
                  {[token, ...unset].map((value) => (
                    <SelectItem key={value} value={value}>
                      {tokenLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <OklchField
                label={`${tokenLabel(token)} colour`}
                colour={overrides[token] ?? ""}
                onChange={(colour, settle) =>
                  onChange({ ...overrides, [token]: colour }, settle)
                }
                className="flex-1"
              />
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
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
