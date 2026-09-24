"use client"

import type * as React from "react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ArrowRightIcon, CheckIcon, LinkIcon } from "@phosphor-icons/react"

import { BlockBrowser } from "@/components/page-builder/block-browser"
import { BuilderComposer } from "@/components/page-builder/builder-composer"
import { BuiltPageFrame } from "@/components/page-builder/built-page-frame"
import {
  DEFAULT_PRESET,
  PresetMenu,
} from "@/components/page-builder/preset-menu"
import { copyToClipboardWithMeta } from "@/components/copy-button"
import { ShadcncraftCredit } from "@/components/shadcncraft-examples/credit"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarProvider,
} from "@/components/ui/sidebar"
import type { JevPresetReading } from "@/lib/jev-presets/read-preset"
import { applyPageEdit } from "@/lib/page-builder/edits"
import type { PageEdit } from "@/lib/page-builder/messages"
import type { PageReading } from "@/lib/page-builder/read-page"
import { savedPageQuery, type SavedPage } from "@/lib/page-builder/saved-page"
import type { LayoutSlot, PageLayout } from "@/lib/page-builder/sections"

type BuildResult = {
  page: PageReading
  preset: JevPresetReading
  model: string
  ms: number
}

/** One block on the page. The key survives reordering; the block can repeat. */
type Row = { key: string; block: string }

type Draft = {
  /** The reading this draft was edited from; a newer reading replaces it. */
  basedOn?: PageReading
  rows: Row[]
  layout: PageLayout
}

const MIN_LENGTH = 3
/** A new page has nothing on it — no header, sidebar or footer — until chosen. */
const EMPTY_DRAFT: Draft = {
  rows: [],
  layout: { header: null, sidebar: null, footer: null },
}

const IDEAS = [
  { label: "Coffee shop", description: "landing page for a cosy coffee shop" },
  { label: "SaaS pricing", description: "saas pricing page with faqs" },
  { label: "Ceramics shop", description: "shop selling handmade ceramics" },
  {
    label: "Sales dashboard",
    description: "dark fintech dashboard for sales teams",
  },
  {
    label: "Portfolio",
    description: "brutalist portfolio with a contact form",
  },
]

async function fetchBuiltPage(
  description: string,
  signal: AbortSignal
): Promise<BuildResult> {
  const response = await fetch("/api/jev/page", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
    signal,
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? "Something went wrong.")
  }
  return (await response.json()) as BuildResult
}

function draftFromSaved(saved: SavedPage): Draft {
  return {
    rows: saved.spec.blocks.map((block, index) => ({
      key: `saved-${index}-${block}`,
      block,
    })),
    layout: saved.spec.layout,
  }
}

function draftFromReading(reading: PageReading): Draft {
  return {
    basedOn: reading,
    rows: reading.chosen.map((block, index) => ({
      key: `jev-${index}-${block}`,
      block,
    })),
    layout: reading.layout,
  }
}

/**
 * Build a page from shadcncraft blocks. The sidebar is where blocks come
 * from: browse them and click one to add it. The preview is the page itself,
 * and where it is edited: each block has a toolbar to move or remove it.
 * Describing the page in the composer is optional — Jev lays out a first
 * draft, blocks and preset, to edit from.
 *
 * A preset picked here stays on top of every page built after it until it
 * is handed back to Jev.
 *
 * The page lives in the URL as it changes, so a reload or a shared link
 * opens it as it was, without asking Jev again.
 */
export function PageBuilder({ saved }: { saved: SavedPage | null }) {
  const [input, setInput] = useState("")
  // What was last sent; Jev reads a description once, when it is sent.
  const [description, setDescription] = useState("")
  const ready = description.length >= MIN_LENGTH

  const result = useQuery({
    queryKey: ["page-builder", description.toLowerCase()],
    queryFn: ({ signal }) => fetchBuiltPage(description, signal),
    enabled: ready,
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    retry: false,
  })
  // Kept while the next draft is on its way: the page stays until replaced.
  const jev = result.data
  const busy = ready && result.isFetching

  // Jev's layout until the visitor edits it; a newer reading starts over.
  const [draft, setDraft] = useState<Draft>(() =>
    saved ? draftFromSaved(saved) : EMPTY_DRAFT
  )
  const page =
    jev && draft.basedOn !== jev.page ? draftFromReading(jev.page) : draft
  const blocks = page.rows.map((row) => row.block)
  // Anything chosen shows, a header on its own included: nothing on the page
  // is ever active out of sight.
  const hasPage =
    blocks.length > 0 || Object.values(page.layout).some((id) => id !== null)

  function edit(next: Partial<Omit<Draft, "basedOn">>) {
    setDraft({ ...page, ...next, basedOn: jev?.page })
  }

  function send(text: string) {
    // Sending the same words again returns the cached reading; dropping the
    // edits lets it lay the page out again, as sending promises.
    setDraft(EMPTY_DRAFT)
    setDescription(text)
  }

  function editInPlace(change: PageEdit) {
    const next = applyPageEdit(
      { items: page.rows, layout: page.layout },
      change
    )
    edit({ rows: next.items, layout: next.layout })
  }

  function addBlock(block: string) {
    edit({ rows: [...page.rows, { key: crypto.randomUUID(), block }] })
  }

  function toggleLayout(slot: LayoutSlot, block: string) {
    edit({
      layout: {
        ...page.layout,
        [slot]: page.layout[slot] === block ? null : block,
      },
    })
  }

  // A saved page's preset was chosen for it, so it stays on top like a pick.
  const [presetOverride, setPresetOverride] = useState(
    saved?.preset ?? undefined
  )
  const jevPreset = jev?.preset.code
  const presetCode = presetOverride ?? jevPreset ?? DEFAULT_PRESET

  const query = savedPageQuery({ blocks, layout: page.layout }, presetCode)
  useEffect(() => {
    // Replaced, not pushed: every edit is not a place to go Back to.
    const url = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname
    if (url !== window.location.pathname + window.location.search) {
      window.history.replaceState(window.history.state, "", url)
    }
  }, [query])

  const composer = (floating: boolean) => (
    <BuilderComposer
      value={input}
      onChange={setInput}
      onSubmit={send}
      pending={busy}
      status={jev ? `Drafted by ${jev.model} in ${jev.ms} ms` : undefined}
      error={result.isError && ready ? result.error.message : undefined}
      floating={floating}
    />
  )

  return (
    <SidebarProvider
      className="h-full min-h-0 flex-col overflow-hidden md:flex-row"
      // Room for preview cards: shadcncraft's own browser runs its sidebar at
      // about this width.
      style={{ "--sidebar-width": "24rem" } as React.CSSProperties}
    >
      <Sidebar
        collapsible="none"
        className="max-h-[45dvh] w-full shrink-0 border-b border-border/70 md:h-full md:max-h-none md:w-(--sidebar-width) md:border-r md:border-b-0"
      >
        <h1 className="sr-only">Build a page</h1>
        {/* Its own scroller: reaching either end stops here rather than
            handing the rest of the gesture to the page. */}
        <SidebarContent className="overscroll-contain px-3 pt-3">
          <BlockBrowser
            suggestedGroup={jev?.page.kind}
            layout={page.layout}
            onAdd={addBlock}
            onToggleLayout={toggleLayout}
          />
        </SidebarContent>

        <SidebarFooter className="gap-2 border-t border-border/70">
          <PresetMenu
            jevCode={jevPreset}
            override={presetOverride}
            onOverride={setPresetOverride}
          />
          <div className="flex items-center justify-between gap-2">
            {hasPage ? <CopyLinkButton /> : <span />}
            <Button
              nativeButton={false}
              render={<Link href={`/preset/${presetCode}`} />}
              variant="ghost"
              size="sm"
            >
              Open preset
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
          <div>
            <ShadcncraftCredit
              credit={{ label: "Blocks", source: "page-builder" }}
              presetCode={presetCode}
            />
          </div>
        </SidebarFooter>
      </Sidebar>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col p-2 md:pt-0 md:pl-0">
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border">
          {hasPage ? (
            <>
              <BuiltPageFrame
                preset={presetCode}
                spec={{ blocks, layout: page.layout }}
                dimmed={busy}
                onEdit={editInPlace}
              />
              {/* Over the page, as the assistant's composer sits over its
                  chat; the gutter keeps the page's edges visible around it. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 *:pointer-events-auto">
                {composer(true)}
              </div>
            </>
          ) : (
            // Nothing to show yet, so the composer sits mid-pane with its
            // heading, as the assistant's does before the first message.
            <div className="flex h-full flex-col justify-center overflow-y-auto bg-background py-8">
              <h2 className="px-4 text-center text-[32px] font-semibold tracking-tight text-balance">
                Describe a page
              </h2>
              <p className="px-4 pt-2 text-center text-sm text-muted-foreground">
                Jev drafts it from shadcncraft blocks, or pick blocks in the
                sidebar.
              </p>
              {composer(false)}
              <ul
                aria-label="Ideas"
                className="mx-auto flex max-w-[690px] flex-wrap justify-center gap-2 px-4"
              >
                {IDEAS.map((idea) => (
                  <li key={idea.label}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInput(idea.description)
                        send(idea.description)
                      }}
                    >
                      {idea.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  )
}

/** Copies the page's link: the URL already holds the page as it stands. */
function CopyLinkButton() {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(id)
  }, [copied])

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        setCopied(await copyToClipboardWithMeta(window.location.href))
      }}
    >
      {copied ? (
        <CheckIcon data-icon="inline-start" />
      ) : (
        <LinkIcon data-icon="inline-start" />
      )}
      {copied ? "Copied" : "Copy link"}
    </Button>
  )
}
