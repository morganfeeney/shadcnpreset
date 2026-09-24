"use client"

import type * as React from "react"
import { useEffect, useRef, useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, XIcon } from "lucide-react"

import { BLOCK_LOADERS } from "@/components/page-builder/block-loaders"
import { SidebarInset, SidebarProvider } from "@/components/cn-ui/sidebar"
import {
  isAppHeader,
  isDashboardWidget,
  sectionOfBlock,
} from "@/lib/page-builder/blocks"
import {
  PAGE_BUILDER_READY_MESSAGE_TYPE,
  pageBuilderEditMessage,
  readPageBuilderBlocksMessage,
  type BuiltPageSpec,
  type PageEdit,
} from "@/lib/page-builder/messages"
import {
  LAYOUT_SLOT_LABELS,
  PAGE_SECTIONS,
  type LayoutSlot,
} from "@/lib/page-builder/sections"
import { cn } from "@/lib/utils"

/** Tables and feeds need the full width a dashboard has, not half of it. */
const FULL_WIDTH_WIDGETS = new Set([
  "metric-cards",
  "campaign-performance",
  "deals-table",
  "top-landing-pages",
  "engagement-by-day-hour",
])

const SECTION_LABELS = new Map(PAGE_SECTIONS.map((s) => [s.id, s.label]))

/** Asks the builder for an edit; the new layout comes back by message. */
function requestEdit(edit: PageEdit) {
  window.parent.postMessage(
    pageBuilderEditMessage(edit),
    window.location.origin
  )
}

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

function ToolbarButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-7 place-items-center rounded-md outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-35 disabled:hover:bg-transparent [&_svg]:size-4"
    >
      {children}
    </button>
  )
}

/**
 * The builder's controls on a block, shown while it is hovered or holds
 * focus. Fixed neutral colours, not the preset's: it is the builder's chrome,
 * and it has to read on any page.
 */
function Toolbar({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div
      role="toolbar"
      aria-label={label}
      className="absolute top-2 right-2 z-50 hidden items-center gap-0.5 rounded-lg bg-neutral-950/90 p-1 text-white shadow-lg ring-1 ring-white/10 backdrop-blur group-focus-within/block:flex group-hover/block:flex"
    >
      <span className="px-2 text-xs font-medium">{label}</span>
      {children}
    </div>
  )
}

const EDITABLE =
  "group/block relative outline-2 -outline-offset-2 outline-transparent hover:outline-sky-500/70 focus-within:outline-sky-500/70"

/** A block on the page, with its toolbar and the outline that marks it. */
function EditableBlock({
  id,
  index,
  count,
  className,
}: {
  id: string
  index: number
  count: number
  className?: string
}) {
  const label = SECTION_LABELS.get(sectionOfBlock(id)) ?? id
  return (
    <div
      data-block={id}
      // Each block is its own stacking context: backgrounds shadcncraft puts
      // at `z-[-1]` (hero-2's photo) would otherwise sink behind the page.
      className={cn(EDITABLE, "isolate", className)}
    >
      <Toolbar label={label}>
        <ToolbarButton
          label={`Move ${label} up`}
          disabled={index === 0}
          onClick={() =>
            requestEdit({ action: "move", index, block: id, by: -1 })
          }
        >
          <ArrowUpIcon />
        </ToolbarButton>
        <ToolbarButton
          label={`Move ${label} down`}
          disabled={index === count - 1}
          onClick={() =>
            requestEdit({ action: "move", index, block: id, by: 1 })
          }
        >
          <ArrowDownIcon />
        </ToolbarButton>
        <ToolbarButton
          label={`Remove ${label}`}
          onClick={() => requestEdit({ action: "remove", index, block: id })}
        >
          <XIcon />
        </ToolbarButton>
      </Toolbar>
      <Block id={id} />
    </div>
  )
}

/** A header or footer, which only comes off: the browser puts a new one in. */
function SlotBlock({
  id,
  slot,
  className,
}: {
  id: string
  slot: LayoutSlot
  className?: string
}) {
  const label = LAYOUT_SLOT_LABELS[slot]
  return (
    <div data-block={id} className={cn(EDITABLE, className)}>
      <Toolbar label={label}>
        <ToolbarButton
          label={`Remove ${label.toLowerCase()}`}
          onClick={() => requestEdit({ action: "clear", slot })}
        >
          <XIcon />
        </ToolbarButton>
      </Toolbar>
      <Block id={id} />
    </div>
  )
}

/**
 * The blocks in order. Dashboard widgets are cards, so a run of them shares
 * a two-column grid; everything else stacks.
 */
function Body({ blocks }: { blocks: string[] }) {
  const runs: { widgets: boolean; start: number; ids: string[] }[] = []
  blocks.forEach((id, index) => {
    const widgets = isDashboardWidget(id)
    const last = runs.at(-1)
    if (last && last.widgets === widgets) last.ids.push(id)
    else runs.push({ widgets, start: index, ids: [id] })
  })

  return runs.map((run) => {
    // Blocks can repeat, so position is part of the key.
    const items = run.ids.map((id, offset) => (
      <EditableBlock
        key={`${run.start + offset}:${id}`}
        id={id}
        index={run.start + offset}
        count={blocks.length}
        className={
          run.widgets
            ? FULL_WIDTH_WIDGETS.has(sectionOfBlock(id))
              ? "min-w-0 lg:col-span-2"
              : "min-w-0"
            : undefined
        }
      />
    ))
    return run.widgets ? (
      <div key={run.start} className="grid items-start gap-4 lg:grid-cols-2">
        {items}
      </div>
    ) : (
      items
    )
  })
}

/**
 * A page assembled from shadcncraft blocks, in the builder's order, inside
 * the header, sidebar and footer it chose — and the place the visitor edits
 * it: each block carries a toolbar to move or remove it.
 *
 * With a sidebar — or an app header, whose trigger needs the sidebar's
 * provider — the page is an app shell sized to the frame, with the header on
 * top and the blocks scrolling beneath it. Otherwise it is a website: a
 * sticky header, the blocks, the footer.
 *
 * Starts from the frame's URL, asks the builder for the current layout once
 * it is listening, then follows the builder's messages, so edits never reload
 * the frame. A newly added block is scrolled into view.
 *
 * Each block sits in a `data-block` wrapper, which the thumbnail script finds
 * it by. The sidebar is the exception: an extra element would break the
 * inset sidebar's peer styling, so it is found by its own `data-slot`.
 */
export function BuiltPage(initial: BuiltPageSpec) {
  const [spec, setSpec] = useState(initial)
  const countRef = useRef(initial.blocks.length)

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

  useEffect(() => {
    const added = spec.blocks.length > countRef.current
    countRef.current = spec.blocks.length
    if (!added) return
    // The browser only adds at the end, so the last block is the new one.
    const blocks = document.querySelectorAll("[data-block]")
    const last = [...blocks]
      .filter((el) => el.getAttribute("data-block") === spec.blocks.at(-1))
      .at(-1)
    last?.scrollIntoView?.({ behavior: "smooth", block: "start" })
  }, [spec.blocks])

  const { header, sidebar, footer } = spec.layout

  if (sidebar || isAppHeader(header)) {
    return (
      <div className="h-svh bg-background text-foreground">
        <SidebarProvider className="h-full min-h-0">
          {sidebar ? <Block id={sidebar} /> : null}
          <SidebarInset className="min-h-0 overflow-hidden">
            {header ? <SlotBlock id={header} slot="header" /> : null}
            {/* `*:shrink-0`, as shadcncraft ships its shells: cards are
                `overflow-hidden`, so as flex items they would shrink to fit
                the frame and clip instead of scrolling. */}
            <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 *:shrink-0">
              <Body blocks={spec.blocks} />
              {footer ? <SlotBlock id={footer} slot="footer" /> : null}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background px-2 text-foreground">
      {header ? (
        <SlotBlock
          id={header}
          slot="header"
          className="sticky top-0 z-50 bg-background"
        />
      ) : null}
      {/* The app shell's inset is already the page's <main>. */}
      <main>
        <Body blocks={spec.blocks} />
      </main>
      {footer ? <SlotBlock id={footer} slot="footer" /> : null}
    </div>
  )
}
