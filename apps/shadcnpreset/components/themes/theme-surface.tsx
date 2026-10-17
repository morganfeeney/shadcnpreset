"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import {
  PresetThemeSurface,
  type RegistryThemeSurface,
} from "@/components/preset-theme-surface"
import { PresetFontLoader } from "@/components/preset-font-loader"
import { useThemeFonts } from "@/components/themes/theme-fonts"
import { useMounted } from "@/hooks/use-mounted"
import { getPresetThemeCssBundle } from "@/lib/preset-theme-css"
import { DEFAULT_CONFIG } from "@/registry/config"

/**
 * The site's resolved mode, or null until mounted so the first paint matches
 * the server (see PRESET_LIGHT_DARK_STYLING_GUIDE.md).
 */
export function useSurfaceMode(): "light" | "dark" | null {
  const { resolvedTheme } = useTheme()
  const mounted = useMounted()
  if (!mounted) return null
  return resolvedTheme === "dark" ? "dark" : "light"
}

/** `registryTheme` for a preset code, built on the client like the preset cards. */
export function useRegistryTheme(code: string): RegistryThemeSurface | null {
  return React.useMemo(
    () => getPresetThemeCssBundle(code)?.registryTheme ?? null,
    [code]
  )
}

/**
 * A theme's colors on the default style, in the fonts picked for it (the
 * default fonts until then), never its preset's.
 */
export function ThemeSurface({
  registryTheme,
  mode,
  className,
  children,
}: {
  registryTheme: RegistryThemeSurface
  mode: "light" | "dark"
  className?: string
  children: React.ReactNode
}) {
  const fonts = useThemeFonts()

  return (
    <PresetThemeSurface
      registryTheme={registryTheme}
      surfaceMode={mode}
      bodyFont={fonts?.body ?? DEFAULT_CONFIG.font}
      headingFont={
        fonts && fonts.heading !== fonts.body
          ? fonts.heading
          : DEFAULT_CONFIG.fontHeading
      }
      styleName={DEFAULT_CONFIG.style}
      className={className}
    >
      {fonts ? (
        <PresetFontLoader fontValues={[fonts.heading, fonts.body]} />
      ) : null}
      {children}
    </PresetThemeSurface>
  )
}
