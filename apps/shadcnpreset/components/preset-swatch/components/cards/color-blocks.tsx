"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/poc/ui/card"
import { StyleOverviewTokenGrid } from "@/components/preset-swatch/components/cards/style-overview-tokens"

/**
 * Port of v4 `registry/bases/radix/blocks/preview/cards/style-overview.tsx`, using
 * preset props instead of `useDesignSystemSearchParams`. Composes {@link StyleOverviewTokenGrid}
 * in the same card. Pair with {@link PreviewIconGrid} in the parent for the full column.
 */
export function ColorBlocks() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6 style-lyra:gap-4 style-mira:gap-4">
        <StyleOverviewTokenGrid />
      </CardContent>
    </Card>
  )
}
