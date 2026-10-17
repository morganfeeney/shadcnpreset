"use client"

import * as React from "react"

import { getPresetThemeCssBundle } from "@/lib/preset-theme-css"
import { presetThemeCommand } from "@/lib/preset-themes"
import {
  DEFAULT_THEME_FONTS,
  parseThemeFontsParam,
  sameThemeFonts,
  themeCodeWithFonts,
  themeFontsParam,
  type ThemeFonts,
} from "@/lib/theme-fonts"

const PARAM = "fonts"

// Module state rather than React state: each theme page remounts when you
// switch theme, and the fonts you picked should come with you.
let current: ThemeFonts | null = null
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function writeUrl() {
  const url = new URL(window.location.href)
  if (current) url.searchParams.set(PARAM, themeFontsParam(current))
  else url.searchParams.delete(PARAM)
  if (url.href !== window.location.href) {
    window.history.replaceState(null, "", url)
  }
}

/** Fonts to add to the theme, or null for the theme's colors alone. */
export function setThemeFonts(fonts: ThemeFonts | null) {
  current = fonts && !sameThemeFonts(fonts, DEFAULT_THEME_FONTS) ? fonts : null
  writeUrl()
  for (const listener of listeners) listener()
}

/** The fonts picked for theme pages; null on the server and by default. */
export function useThemeFonts(): ThemeFonts | null {
  return React.useSyncExternalStore(
    subscribe,
    () => current,
    () => null
  )
}

/**
 * Keeps `?fonts=` and the picked fonts in step: a shared link sets them, and
 * fonts picked on one theme carry over to the next one's URL.
 */
export function useThemeFontsUrl(pathname: string) {
  React.useEffect(() => {
    const fromUrl = parseThemeFontsParam(
      new URLSearchParams(window.location.search).get(PARAM)
    )
    if (fromUrl) setThemeFonts(fromUrl)
    else writeUrl()
  }, [pathname])
}

/** The command and CSS for the theme, with the picked fonts when there are any. */
export function useThemeInstall({ code, css }: { code: string; css: string }) {
  const fonts = useThemeFonts()

  return React.useMemo(() => {
    if (!fonts) return { fonts, command: presetThemeCommand(code), css }
    const withFonts = themeCodeWithFonts(code, fonts)
    return {
      fonts,
      command: presetThemeCommand(withFonts, { fonts: true }),
      css: getPresetThemeCssBundle(withFonts)?.combinedCss ?? css,
    }
  }, [fonts, code, css])
}
