"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import {
  PresetThemeSurface,
  type RegistryThemeSurface,
} from "@/components/preset-theme-surface"
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

/** A theme's colors only: the default style and fonts, not its preset's. */
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
  return (
    <PresetThemeSurface
      registryTheme={registryTheme}
      surfaceMode={mode}
      bodyFont={DEFAULT_CONFIG.font}
      headingFont={DEFAULT_CONFIG.fontHeading}
      styleName={DEFAULT_CONFIG.style}
      className={className}
    >
      {children}
    </PresetThemeSurface>
  )
}
