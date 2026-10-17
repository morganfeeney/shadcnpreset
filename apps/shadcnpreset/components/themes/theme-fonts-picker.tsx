"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  CaretDownIcon,
  CaretUpDownIcon,
  CheckIcon,
} from "@phosphor-icons/react"

import { PresetFontLoader } from "@/components/preset-font-loader"
import {
  setThemeFonts,
  useThemeFonts,
  useThemeFontsUrl,
} from "@/components/themes/theme-fonts"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FONT_DEFINITIONS, getFontDefinition } from "@/lib/font-definitions"
import {
  DEFAULT_THEME_FONTS,
  sameThemeFonts,
  type CommunityFontPairing,
  type ThemeFonts,
} from "@/lib/theme-fonts"
import { cn } from "@/lib/utils"

/** A native select styled like the site's inputs, its caret inset from the edge. */
function FontSelect({
  label,
  ...props
}: { label: string } & React.ComponentProps<"select">) {
  return (
    <label className="grid gap-1.5 text-xs text-muted-foreground">
      {label}
      <span className="relative">
        <select
          className="h-9 w-full min-w-0 appearance-none rounded-lg border border-input bg-transparent pr-8 pl-2.5 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          {...props}
        />
        <CaretDownIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
      </span>
    </label>
  )
}

function fontTitle(name: string) {
  return getFontDefinition(name)?.title ?? name
}

function fontFamily(name: string) {
  return getFontDefinition(name)?.family
}

function pairingLabel(fonts: ThemeFonts) {
  return fonts.heading === fonts.body
    ? fontTitle(fonts.body)
    : `${fontTitle(fonts.heading)} / ${fontTitle(fonts.body)}`
}

function PairingOption({
  fonts,
  meta,
  selected,
  onSelect,
}: {
  fonts: ThemeFonts
  meta: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className={cn(
          "flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-muted",
          selected && "bg-muted"
        )}
      >
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-base font-bold ring-1 ring-foreground/5"
          style={{ fontFamily: fontFamily(fonts.heading) }}
        >
          Aa
        </span>
        <span className="grid min-w-0 flex-1">
          <span
            className="truncate text-sm font-semibold"
            style={{ fontFamily: fontFamily(fonts.heading) }}
          >
            {fontTitle(fonts.heading)}
          </span>
          <span
            className="truncate text-xs text-muted-foreground"
            style={{ fontFamily: fontFamily(fonts.body) }}
          >
            {fonts.heading === fonts.body
              ? "Heading and body"
              : fontTitle(fonts.body)}
          </span>
        </span>
        <span className="text-[11px] whitespace-nowrap text-muted-foreground">
          {meta}
        </span>
        <CheckIcon
          aria-hidden
          className={cn("size-4 shrink-0", !selected && "invisible")}
        />
      </button>
    </li>
  )
}

/**
 * Adds a font pairing to the theme: the previews use it, and the command and
 * CSS include it. Suggestions are pairings community presets use, with the
 * ones used alongside this theme first.
 */
export function ThemeFontsPicker({
  themeSlug,
  suggestions,
}: {
  themeSlug: string
  suggestions: CommunityFontPairing[]
}) {
  const [open, setOpen] = React.useState(false)
  const fonts = useThemeFonts()
  const active = fonts ?? DEFAULT_THEME_FONTS
  useThemeFontsUrl(usePathname())

  const pick = (next: ThemeFonts | null) => {
    setThemeFonts(next)
    setOpen(false)
  }
  const isActive = (pairing: ThemeFonts) =>
    fonts !== null && sameThemeFonts(pairing, fonts)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="min-w-0 shrink"
          />
        }
      >
        <span
          aria-hidden
          className="font-bold"
          style={{ fontFamily: fontFamily(active.heading) }}
        >
          Aa
        </span>
        <span className="truncate">
          {fonts ? pairingLabel(fonts) : "Fonts"}
        </span>
        <CaretUpDownIcon aria-hidden />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(23rem,calc(100vw-2rem))] p-2"
      >
        <PresetFontLoader
          fontValues={suggestions.flatMap((pairing) => [
            pairing.heading,
            pairing.body,
          ])}
        />
        <p className="px-2 py-1.5 text-xs text-muted-foreground">
          Pairings from community presets
        </p>
        <ul className="grid gap-0.5">
          <PairingOption
            fonts={DEFAULT_THEME_FONTS}
            meta="Colors only"
            selected={fonts === null}
            onSelect={() => pick(null)}
          />
          {suggestions.map((pairing) => (
            <PairingOption
              key={`${pairing.heading}/${pairing.body}`}
              fonts={pairing}
              meta={
                pairing.themeSlugs.includes(themeSlug)
                  ? "Used with this theme"
                  : `${pairing.presets} ${pairing.presets === 1 ? "preset" : "presets"}`
              }
              selected={isActive(pairing)}
              onSelect={() => pick(pairing)}
            />
          ))}
        </ul>
        <div className="my-1 h-px bg-border" />
        <div className="grid grid-cols-2 gap-2 p-2">
          <FontSelect
            label="Heading"
            value={active.heading === active.body ? "inherit" : active.heading}
            onChange={(event) =>
              setThemeFonts({
                heading:
                  event.target.value === "inherit"
                    ? active.body
                    : (event.target.value as ThemeFonts["heading"]),
                body: active.body,
              })
            }
          >
            <option value="inherit">Same as body</option>
            {FONT_DEFINITIONS.map((font) => (
              <option key={font.name} value={font.name}>
                {font.title}
              </option>
            ))}
          </FontSelect>
          <FontSelect
            label="Body"
            value={active.body}
            onChange={(event) => {
              const body = event.target.value as ThemeFonts["body"]
              setThemeFonts({
                heading: active.heading === active.body ? body : active.heading,
                body,
              })
            }}
          >
            {FONT_DEFINITIONS.map((font) => (
              <option key={font.name} value={font.name}>
                {font.title}
              </option>
            ))}
          </FontSelect>
        </div>
      </PopoverContent>
    </Popover>
  )
}
