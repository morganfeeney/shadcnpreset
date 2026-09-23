"use client"

import { useEffect, useState } from "react"

import { BLOCK_LOADERS } from "@/components/page-builder/block-loaders"
import { AppShell1 } from "@/components/shadcncraft-examples/blocks/app-shell-1"
import { knownBlocks, sectionOfBlock } from "@/lib/page-builder/blocks"
import {
  isPageBuilderBlocksMessage,
  PAGE_BUILDER_READY_MESSAGE_TYPE,
} from "@/lib/page-builder/messages"
import type { PageKind } from "@/lib/page-builder/sections"

/** Tables and feeds need the full width a dashboard has, not half of it. */
const FULL_WIDTH_WIDGETS = new Set([
  "metric-cards",
  "campaign-performance",
  "deals-table",
  "top-landing-pages",
  "engagement-by-day-hour",
])

function Block({ id }: { id: string }) {
  const Component = BLOCK_LOADERS[id]
  if (!Component) return null
  // Heroes bring their own sticky nav; a bare nav needs the same.
  return sectionOfBlock(id) === "top-navigation" ? (
    <div className="sticky top-0 z-50">
      <Component />
    </div>
  ) : (
    <Component />
  )
}

type Layout = { kind: PageKind; blocks: string[] }

/**
 * A page assembled from shadcncraft blocks, in the order the builder lists
 * them: inside the app shell for a dashboard, stacked for any other page.
 *
 * Starts from the frame's URL, asks the builder for the current layout once
 * it is listening, then follows the builder's messages, so reordering or
 * swapping blocks never reloads the frame.
 */
export function BuiltPage(initial: Layout) {
  const [layout, setLayout] = useState(initial)

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (!isPageBuilderBlocksMessage(event.data)) return
      const { kind, blocks } = event.data
      setLayout({ kind, blocks: knownBlocks(kind, blocks) })
    }
    window.addEventListener("message", onMessage)
    // Now listening: ask the builder for the current layout, which may have
    // moved on from the one in this frame's URL.
    window.parent.postMessage(
      { type: PAGE_BUILDER_READY_MESSAGE_TYPE },
      window.location.origin
    )
    return () => window.removeEventListener("message", onMessage)
  }, [])

  // Blocks can repeat, so position is part of the key.
  const keyed = layout.blocks.map((id, index) => ({
    id,
    key: `${index}:${id}`,
  }))

  if (layout.kind === "dashboard") {
    return (
      <div className="h-svh bg-background text-foreground">
        <AppShell1>
          <div className="grid items-start gap-4 lg:grid-cols-2">
            {keyed.map(({ id, key }) => (
              <div
                key={key}
                className={
                  FULL_WIDTH_WIDGETS.has(sectionOfBlock(id))
                    ? "min-w-0 lg:col-span-2"
                    : "min-w-0"
                }
              >
                <Block id={id} />
              </div>
            ))}
          </div>
        </AppShell1>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background px-2 text-foreground">
      {keyed.map(({ id, key }) => (
        <Block key={key} id={id} />
      ))}
    </div>
  )
}
