"use client"

import * as React from "react"

/** CSS variable names (no `var()`), same as v4 `style-overview` preview card. */
export const STYLE_OVERVIEW_TOKEN_VARS = [
  "--background",
  "--foreground",
  "--primary",
  "--secondary",
  "--muted",
  "--accent",
  "--border",
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
] as const

export function StyleOverviewTokenGrid() {
  return (
    <div className="@container grid grid-cols-6 gap-3">
      {STYLE_OVERVIEW_TOKEN_VARS.map((variant) => (
        <div
          key={variant}
          className="flex flex-col flex-wrap items-center gap-2"
        >
          <div
            className="relative aspect-square w-full rounded-lg bg-(--color) after:absolute after:inset-0 after:rounded-lg after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten style-sera:rounded-none style-sera:after:rounded-none"
            style={
              {
                "--color": `var(${variant})`,
              } as React.CSSProperties
            }
          />
          <div className="hidden max-w-14 truncate font-mono text-[0.60rem] @md:block style-lyra:max-w-10 style-mira:max-w-10">
            {variant}
          </div>
        </div>
      ))}
    </div>
  )
}
