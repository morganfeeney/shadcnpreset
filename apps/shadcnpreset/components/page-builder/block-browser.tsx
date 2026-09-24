"use client"

import { useDeferredValue, useState } from "react"
import { MagnifyingGlassIcon, MinusIcon, PlusIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { layoutChoices } from "@/lib/page-builder/blocks"
import {
  LAYOUT_SLOTS,
  LAYOUT_SLOT_LABELS,
  PAGE_KINDS,
  PAGE_SECTIONS,
  type LayoutSlot,
  type PageKind,
  type PageLayout,
} from "@/lib/page-builder/sections"
import { PAGE_BLOCK_VARIANTS } from "@/lib/page-builder/variants"
import { cn } from "@/lib/utils"

type BrowserItem = {
  id: string
  title: string
  description: string
  /** The badge on the card: the block's section, or its layout slot. */
  label: string
  /** The chips it shows under. */
  groups: readonly Group[]
  /** Set for headers, sidebars and footers, which fill a slot, not the page. */
  slot?: LayoutSlot
}

type Group = PageKind | "layout"

const GROUP_LABELS: Record<Group, string> = {
  marketing: "Marketing",
  store: "Store",
  dashboard: "Dashboard",
  layout: "Layout",
}
const GROUPS: readonly Group[] = [...PAGE_KINDS, "layout"]
const ALL = "all"

/** Every section's blocks in page order, then every header, sidebar and footer. */
const ITEMS: BrowserItem[] = [
  ...PAGE_SECTIONS.flatMap((section) =>
    (PAGE_BLOCK_VARIANTS[section.id] ?? []).map((variant) => ({
      ...variant,
      label: section.label,
      groups: section.kinds,
    }))
  ),
  ...LAYOUT_SLOTS.flatMap((slot) =>
    layoutChoices(slot).flatMap(({ variants }) =>
      variants.map((variant) => ({
        ...variant,
        label: LAYOUT_SLOT_LABELS[slot],
        groups: ["layout"] as const,
        slot,
      }))
    )
  ),
]

function matches(item: BrowserItem, query: string) {
  if (!query) return true
  const text = `${item.label} ${item.title} ${item.description}`.toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => text.includes(word))
}

/**
 * Where blocks come from: search, narrow by kind, click a card to add it to
 * the end of the page. Headers, sidebars and footers take their slot instead;
 * the one in a slot says so, and clicking it takes it off.
 *
 * The thumbnails are screenshots in the default preset, from
 * `pnpm generate:page-builder-thumbnails`; the page itself shows the preset.
 */
export function BlockBrowser({
  suggestedGroup,
  layout,
  onAdd,
  onToggleLayout,
}: {
  /** Jev's kind of page, shown first until the visitor picks a chip. */
  suggestedGroup?: PageKind
  layout: PageLayout
  onAdd: (id: string) => void
  onToggleLayout: (slot: LayoutSlot, id: string) => void
}) {
  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query.trim())
  const [picked, setPicked] = useState<Group | typeof ALL>()
  const group = picked ?? suggestedGroup ?? ALL

  const shown = ITEMS.filter(
    (item) =>
      (group === ALL || item.groups.includes(group)) &&
      matches(item, deferredQuery)
  )

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-3 pb-3">
      <div className="sticky top-0 z-10 -mx-3 grid gap-2 bg-sidebar px-3 pb-1">
        <InputGroup className="bg-background">
          <InputGroupAddon>
            <MagnifyingGlassIcon aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search blocks"
            placeholder={`Search ${ITEMS.length} blocks…`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>
        <ul aria-label="Kinds of block" className="flex flex-wrap gap-1.5">
          {([ALL, ...GROUPS] as const).map((g) => (
            <li key={g}>
              <Button
                type="button"
                size="sm"
                variant={g === group ? "secondary" : "outline"}
                aria-pressed={g === group}
                onClick={() => setPicked(g)}
              >
                {g === ALL ? "All" : GROUP_LABELS[g]}
              </Button>
            </li>
          ))}
        </ul>
        <p
          className="text-xs text-muted-foreground tabular-nums"
          aria-live="polite"
        >
          {shown.length} {shown.length === 1 ? "block" : "blocks"}
        </p>
      </div>

      <ul className="grid grid-cols-[minmax(0,1fr)] gap-3">
        {shown.map((item) => (
          <li key={item.id}>
            <BlockCard
              item={item}
              inUse={item.slot ? layout[item.slot] === item.id : false}
              onPick={() =>
                item.slot ? onToggleLayout(item.slot, item.id) : onAdd(item.id)
              }
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

function BlockCard({
  item,
  inUse,
  onPick,
}: {
  item: BrowserItem
  inUse: boolean
  onPick: () => void
}) {
  const slot = item.slot ? LAYOUT_SLOT_LABELS[item.slot].toLowerCase() : null
  const action = !slot
    ? "Add to page"
    : inUse
      ? `Remove ${slot}`
      : `Use as ${slot}`

  return (
    <button
      type="button"
      onClick={onPick}
      aria-label={`${action}: ${item.label} · ${item.title}`}
      title={item.description}
      className={cn(
        "group/card grid w-full gap-2 rounded-lg border bg-background p-2 text-left transition-colors outline-none",
        "hover:border-ring/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        inUse && "border-ring/60 ring-1 ring-ring/40"
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <Badge variant={inUse ? "default" : "outline"} className="shrink-0">
          {inUse ? `Your ${slot}` : item.label}
        </Badge>
        <span className="truncate text-sm font-medium">{item.title}</span>
      </span>
      <span className="block overflow-hidden rounded-md border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- static
            512px thumbnails; the image optimiser adds nothing here. */}
        <img
          src={`/page-builder/thumbnails/light/${item.id}.jpg`}
          alt=""
          loading="lazy"
          className="block max-h-56 w-full object-cover object-top dark:hidden"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/page-builder/thumbnails/dark/${item.id}.jpg`}
          alt=""
          loading="lazy"
          className="hidden max-h-56 w-full object-cover object-top dark:block"
        />
      </span>
      <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground group-hover/card:text-foreground">
        {inUse ? <MinusIcon aria-hidden /> : <PlusIcon aria-hidden />}
        {action}
      </span>
    </button>
  )
}
