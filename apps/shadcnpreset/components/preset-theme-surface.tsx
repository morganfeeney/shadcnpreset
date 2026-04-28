"use client"

import * as React from "react"

import type { buildRegistryTheme } from "@/registry/config"
import { buildPresetSurfaceStyle } from "@/lib/preset-surface-style"
import { cn } from "@/lib/utils"

export type RegistryThemeSurface = ReturnType<typeof buildRegistryTheme>

export type PresetThemeSurfaceProps = {
  registryTheme: RegistryThemeSurface
  /** Which `registryTheme.cssVars` entry to use for the inline tokens. */
  surfaceMode: "light" | "dark"
  bodyFont: string
  /** Raw preset `fontHeading` (not `effectiveHeadingFont`); `"inherit"` → `var(--font-sans)`. */
  headingFont: string
  /** e.g. `vega` → `style-vega` */
  styleName: string
  className?: string
  children: React.ReactNode
}

/**
 * Scopes `buildRegistryTheme` output and fonts in one place: builds the inline
 * CSS variable object and applies `font-sans` + optional `dark` + `style-*` classes.
 */
export function PresetThemeSurface({
  registryTheme,
  surfaceMode,
  bodyFont,
  headingFont,
  styleName,
  className,
  children,
}: PresetThemeSurfaceProps) {
  const style = React.useMemo(
    () =>
      buildPresetSurfaceStyle({
        themeVars: registryTheme.cssVars?.[surfaceMode] as Record<string, string>,
        bodyFont,
        headingFont,
      }),
    [registryTheme, surfaceMode, bodyFont, headingFont]
  )

  const dark = surfaceMode === "dark"

  return (
    <div
      className={cn("font-sans", dark && "dark", `style-${styleName}`, className)}
      style={style}
    >
      {children}
    </div>
  )
}
