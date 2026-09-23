"use client"

import type * as React from "react"
import { useEffect, useState } from "react"

import { BLOCK_LOADERS } from "@/components/page-builder/block-loaders"
import { SidebarInset, SidebarProvider } from "@/components/cn-ui/sidebar"
import { isAppHeader, sectionOfBlock } from "@/lib/page-builder/blocks"
import {
  PAGE_BUILDER_READY_MESSAGE_TYPE,
  readPageBuilderBlocksMessage,
  type BuiltPageSpec,
} from "@/lib/page-builder/messages"

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
  if (sectionOfBlock(id) === "hero") {
    // The page's header is chosen on its own, so the hero leaves its nav out.
    const Hero = Component as React.ComponentType<{ navigation?: boolean }>
    return <Hero navigation={false} />
  }
  return <Component />
}

function Body({ kind, blocks }: Pick<BuiltPageSpec, "kind" | "blocks">) {
  // Blocks can repeat, so position is part of the key.
  const keyed = blocks.map((id, index) => ({ id, key: `${index}:${id}` }))

  if (kind === "dashboard") {
    return (
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
    )
  }

  return keyed.map(({ id, key }) => <Block key={key} id={id} />)
}

/**
 * A page assembled from shadcncraft blocks, in the order the builder lists
 * them, inside the header, sidebar and footer it chose.
 *
 * With a sidebar — or an app header, whose trigger needs the sidebar's
 * provider — the page is an app shell sized to the frame, with the header on
 * top and the blocks scrolling beneath it. Otherwise it is a website: a
 * sticky header, the blocks, the footer.
 *
 * Starts from the frame's URL, asks the builder for the current layout once
 * it is listening, then follows the builder's messages, so reordering or
 * swapping blocks never reloads the frame.
 */
export function BuiltPage(initial: BuiltPageSpec) {
  const [spec, setSpec] = useState(initial)

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      const next = readPageBuilderBlocksMessage(event.data)
      if (next) setSpec(next)
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

  const { header, sidebar, footer } = spec.layout

  if (sidebar || isAppHeader(header)) {
    return (
      <div className="h-svh bg-background text-foreground">
        <SidebarProvider className="h-full min-h-0">
          {sidebar ? <Block id={sidebar} /> : null}
          <SidebarInset className="min-h-0 overflow-hidden">
            {header ? <Block id={header} /> : null}
            {/* `*:shrink-0`, as shadcncraft ships its shells: cards are
                `overflow-hidden`, so as flex items they would shrink to fit
                the frame and clip instead of scrolling. */}
            <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 *:shrink-0">
              <Body kind={spec.kind} blocks={spec.blocks} />
              {footer ? <Block id={footer} /> : null}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background px-2 text-foreground">
      {header ? (
        <div className="sticky top-0 z-50 bg-background">
          <Block id={header} />
        </div>
      ) : null}
      {/* The app shell's inset is already the page's <main>. */}
      <main>
        <Body kind={spec.kind} blocks={spec.blocks} />
      </main>
      {footer ? <Block id={footer} /> : null}
    </div>
  )
}
