"use client"

import * as React from "react"

import type { buildRegistryTheme } from "@/registry/config"
import { buildPresetSurfaceStyle } from "@/lib/preset-surface-style"
import { cn } from "@/lib/utils"

export type RegistryThemeSurface = ReturnType<typeof buildRegistryTheme>

const PresetThemeSurfacePortalContext = React.createContext<HTMLElement | null>(
  null
)

/**
 * An element inside the nearest {@link PresetThemeSurface} for popups to
 * portal into. The `style-*` CSS is scoped by descendant and the theme lives
 * in inline variables, so a menu or dialog portalled to `<body>` loses both.
 * Pass it (`?? undefined`) as the `container` of a Base UI portal that wraps
 * the popup; the popup's own portal then mounts inside it.
 */
export function usePresetThemeSurfacePortal() {
  return React.useContext(PresetThemeSurfacePortalContext)
}

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
        themeVars: registryTheme.cssVars?.[surfaceMode] as Record<
          string,
          string
        >,
        bodyFont,
        headingFont,
      }),
    [registryTheme, surfaceMode, bodyFont, headingFont]
  )

  const dark = surfaceMode === "dark"
  const [portalHost, setPortalHost] = React.useState<HTMLDivElement | null>(
    null
  )

  return (
    <div
      className={cn(
        "font-sans",
        dark && "dark",
        `style-${styleName}`,
        className
      )}
      style={style}
    >
      <PresetThemeSurfacePortalContext.Provider value={portalHost}>
        {children}
      </PresetThemeSurfacePortalContext.Provider>
      <div
        ref={setPortalHost}
        data-slot="preset-theme-surface-portal"
        className="contents"
      />
    </div>
  )
}
