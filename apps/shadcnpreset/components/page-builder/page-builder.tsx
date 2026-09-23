"use client"

import Link from "next/link"
import type * as React from "react"
import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ArrowCounterClockwiseIcon,
  ArrowRightIcon,
  DotsSixVerticalIcon,
  PlusIcon,
  ShuffleIcon,
  XIcon,
} from "@phosphor-icons/react"
import { DEFAULT_PRESET_CONFIG, encodePreset } from "shadcn/preset"

import { BuilderComposer } from "@/components/page-builder/builder-composer"
import { BuiltPageFrame } from "@/components/page-builder/built-page-frame"
import { ShadcncraftCredit } from "@/components/shadcncraft-examples/credit"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useMyPresets } from "@/hooks/use-my-presets"
import type { JevPresetReading } from "@/lib/jev-presets/read-preset"
import {
  blockChoicesForKind,
  defaultLayout,
  knownBlocks,
  layoutChoices,
} from "@/lib/page-builder/blocks"
import type { PageReading } from "@/lib/page-builder/read-page"
import {
  LAYOUT_SLOTS,
  LAYOUT_SLOT_LABELS,
  PAGE_KINDS,
  PAGE_KIND_LABELS,
  type LayoutSlot,
  type PageKind,
  type PageLayout,
} from "@/lib/page-builder/sections"
import { getPresetSwatchPair } from "@/lib/oklch-swatch"
import { parsePresetInput } from "@/lib/parse-preset-input"
import { resolvePresetFromCode } from "@/lib/preset"
import { formatPresetCardDescription } from "@/lib/preset-card-description"
import { generateRandomCompatiblePreset } from "@/lib/random-preset"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"

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
  kind: PageKind
  rows: Row[]
  layout: PageLayout
}

const MIN_LENGTH = 3
const DEFAULT_PRESET = encodePreset(DEFAULT_PRESET_CONFIG)
const EMPTY_DRAFT: Draft = {
  kind: "marketing",
  rows: [],
  layout: defaultLayout("marketing"),
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

function draftFromReading(reading: PageReading): Draft {
  return {
    basedOn: reading,
    kind: reading.kind,
    rows: reading.chosen.map((block, index) => ({
      key: `jev-${index}-${block}`,
      block,
    })),
    layout: reading.layout,
  }
}

/**
 * A page as an ordered list of shadcncraft blocks: drag to reorder, pick
 * each block from one menu, add or remove. Describing the page in the
 * composer is optional — Jev reads it and lays out a first draft, blocks and
 * preset, to edit from.
 *
 * A preset applied here stays on top of every page built after it until it
 * is handed back to Jev.
 */
export function PageBuilder() {
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
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const page =
    jev && draft.basedOn !== jev.page ? draftFromReading(jev.page) : draft
  const blocks = page.rows.map((row) => row.block)

  function edit(next: Partial<Omit<Draft, "basedOn">>) {
    setDraft({ ...page, ...next, basedOn: jev?.page })
  }

  function send(text: string) {
    // Sending the same words again returns the cached reading; dropping the
    // edits lets it lay the page out again, as sending promises.
    setDraft(EMPTY_DRAFT)
    setDescription(text)
  }

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

  const [presetOverride, setPresetOverride] = useState<string>()
  const jevPreset = jev?.preset.code
  const presetCode = presetOverride ?? jevPreset ?? DEFAULT_PRESET

  return (
    <SidebarProvider className="h-full min-h-0 flex-col overflow-hidden md:flex-row">
      <Sidebar
        collapsible="none"
        className="max-h-[45dvh] w-full shrink-0 border-b border-border/70 md:h-full md:max-h-none md:w-(--sidebar-width) md:border-r md:border-b-0"
      >
        <h1 className="sr-only">Build a page</h1>
        {/* Its own scroller: reaching either end stops here rather than
            handing the rest of the gesture to the page. */}
        <SidebarContent className="overscroll-contain">
          <SidebarGroup>
            <SidebarGroupLabel>Page</SidebarGroupLabel>
            <SidebarGroupContent>
              <KindPicker
                kind={page.kind}
                onChange={(kind) =>
                  edit({
                    kind,
                    // Blocks the new kind can show stay; the rest go.
                    rows: page.rows.filter(
                      (row) => knownBlocks(kind, [row.block]).length
                    ),
                    // A dashboard is framed by an app shell, a website by its
                    // navigation and footer: a new kind starts from its own.
                    layout: defaultLayout(kind),
                  })
                }
              />
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Blocks</SidebarGroupLabel>
            <SidebarGroupContent>
              <BlockList
                kind={page.kind}
                rows={page.rows}
                onChange={(rows) => edit({ rows })}
              />
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Layout</SidebarGroupLabel>
            <SidebarGroupContent>
              <LayoutPicker
                layout={page.layout}
                onChange={(layout) => edit({ layout })}
              />
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Preset</SidebarGroupLabel>
            <SidebarGroupContent>
              <PresetControl
                jevCode={jevPreset}
                override={presetOverride}
                onOverride={setPresetOverride}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-border/70">
          <Button
            nativeButton={false}
            render={<Link href={`/preset/${presetCode}`} />}
            variant="outline"
            size="sm"
          >
            Open preset
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
          <ShadcncraftCredit
            credit={{ label: "Blocks", source: "page-builder" }}
            presetCode={presetCode}
          />
        </SidebarFooter>
      </Sidebar>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col p-2 md:pt-0 md:pl-0">
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border">
          {blocks.length ? (
            <>
              <BuiltPageFrame
                preset={presetCode}
                spec={{ kind: page.kind, blocks, layout: page.layout }}
                dimmed={busy}
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
                Jev drafts it from shadcncraft blocks, or add blocks yourself in
                the sidebar.
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

function KindPicker({
  kind,
  onChange,
}: {
  kind: PageKind
  onChange: (kind: PageKind) => void
}) {
  return (
    <ToggleGroup
      variant="outline"
      size="sm"
      className="w-full"
      value={[kind]}
      onValueChange={(value: string[]) => {
        const next = value[0] as PageKind | undefined
        if (next) onChange(next)
      }}
    >
      {PAGE_KINDS.map((option) => (
        <ToggleGroupItem key={option} value={option} className="flex-1">
          {PAGE_KIND_LABELS[option]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

/** "None" in a slot's menu; Base UI selects need a non-null item value. */
const NO_BLOCK = "none"

/**
 * The header, sidebar and footer around the blocks, one menu each. Any
 * choice goes with any other: an app header without a sidebar still works.
 */
function LayoutPicker({
  layout,
  onChange,
}: {
  layout: PageLayout
  onChange: (layout: PageLayout) => void
}) {
  return (
    <div className="grid gap-1.5">
      {LAYOUT_SLOTS.map((slot) => (
        <LayoutSlotPicker
          key={slot}
          slot={slot}
          value={layout[slot]}
          onChange={(id) => onChange({ ...layout, [slot]: id })}
        />
      ))}
    </div>
  )
}

function LayoutSlotPicker({
  slot,
  value,
  onChange,
}: {
  slot: LayoutSlot
  value: string | null
  onChange: (id: string | null) => void
}) {
  const groups = layoutChoices(slot)
  const label = LAYOUT_SLOT_LABELS[slot]
  const items = [
    { value: NO_BLOCK, label: `No ${label.toLowerCase()}` },
    ...groups.flatMap(({ category, variants }) =>
      variants.map((variant) => ({
        value: variant.id,
        label: `${category.label} · ${variant.title}`,
      }))
    ),
  ]

  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <Select
        items={items}
        value={value ?? NO_BLOCK}
        onValueChange={(id: string | null) => {
          if (id) onChange(id === NO_BLOCK ? null : id)
        }}
      >
        <SelectTrigger
          size="sm"
          aria-label={label}
          className="min-w-0 flex-1 bg-background text-xs"
        >
          <SelectValue className="truncate" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          <SelectGroup>
            <SelectItem value={NO_BLOCK}>None</SelectItem>
          </SelectGroup>
          {groups.map(({ category, variants }) => (
            <SelectGroup key={category.id}>
              <SelectLabel>{category.label}</SelectLabel>
              {variants.map((variant) => (
                <SelectItem key={variant.id} value={variant.id}>
                  {variant.title}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/** Every block the kind can show, for the menus: grouped, and labelled for the trigger. */
function useBlockChoices(kind: PageKind) {
  const groups = blockChoicesForKind(kind)
  const items = groups.flatMap(({ section, variants }) =>
    variants.map((variant) => ({
      value: variant.id,
      label:
        variants.length > 1
          ? `${section.label} · ${variant.title}`
          : section.label,
    }))
  )
  return { groups, items }
}

function BlockMenuContent({ kind }: { kind: PageKind }) {
  const { groups } = useBlockChoices(kind)
  return (
    <SelectContent className="max-h-80">
      {groups.map(({ section, variants }) => (
        <SelectGroup key={section.id}>
          <SelectLabel>{section.label}</SelectLabel>
          {variants.map((variant) => (
            <SelectItem key={variant.id} value={variant.id}>
              {variants.length > 1 ? variant.title : section.label}
            </SelectItem>
          ))}
        </SelectGroup>
      ))}
    </SelectContent>
  )
}

function BlockList({
  kind,
  rows,
  onChange,
}: {
  kind: PageKind
  rows: Row[]
  onChange: (rows: Row[]) => void
}) {
  const { items } = useBlockChoices(kind)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const from = rows.findIndex((row) => row.key === active.id)
    const to = rows.findIndex((row) => row.key === over.id)
    onChange(arrayMove(rows, from, to))
  }

  return (
    <div className="grid gap-1.5">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={rows.map((row) => row.key)}
          strategy={verticalListSortingStrategy}
        >
          <ol className="grid gap-1.5">
            {rows.map((row) => (
              <BlockRow
                key={row.key}
                row={row}
                kind={kind}
                items={items}
                onPick={(block) =>
                  onChange(
                    rows.map((r) => (r.key === row.key ? { ...r, block } : r))
                  )
                }
                onRemove={() => onChange(rows.filter((r) => r.key !== row.key))}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <Select
        items={items}
        value={null}
        onValueChange={(block: string | null) => {
          if (block) {
            onChange([...rows, { key: crypto.randomUUID(), block }])
          }
        }}
      >
        <SelectTrigger
          size="sm"
          aria-label="Add a block"
          className="w-full border-dashed bg-transparent text-xs"
        >
          <PlusIcon aria-hidden />
          <span className="text-muted-foreground">Add a block</span>
        </SelectTrigger>
        <BlockMenuContent kind={kind} />
      </Select>
    </div>
  )
}

function BlockRow({
  row,
  kind,
  items,
  onPick,
  onRemove,
}: {
  row: Row
  kind: PageKind
  items: { value: string; label: string }[]
  onPick: (block: string) => void
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.key })
  const label = items.find((item) => item.value === row.block)?.label

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-1 rounded-md bg-sidebar",
        isDragging && "relative z-10 shadow-md"
      )}
    >
      <Button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        type="button"
        variant="ghost"
        size="icon-sm"
        className="cursor-grab text-muted-foreground active:cursor-grabbing"
        aria-label={`Move ${label ?? "block"}`}
      >
        <DotsSixVerticalIcon />
      </Button>
      <Select
        items={items}
        value={row.block}
        onValueChange={(block: string | null) => {
          if (block) onPick(block)
        }}
      >
        <SelectTrigger
          size="sm"
          aria-label="Block"
          className="min-w-0 flex-1 bg-background text-xs"
        >
          <SelectValue className="truncate" />
        </SelectTrigger>
        <BlockMenuContent kind={kind} />
      </Select>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground"
        aria-label={`Remove ${label ?? "block"}`}
        onClick={onRemove}
      >
        <XIcon />
      </Button>
    </li>
  )
}

type PresetOption = {
  value: string
  label: string
  description: string
  swatch: { light: string; dark: string }
}

function presetOption(code: string): PresetOption | null {
  const config = resolvePresetFromCode(code)
  if (!config) return null
  const style = config.style.charAt(0).toUpperCase() + config.style.slice(1)
  return {
    value: config.code,
    label: `${style} · ${config.baseColor} · ${config.theme}`,
    description: formatPresetCardDescription(config),
    swatch: getPresetSwatchPair(config, "primary"),
  }
}

function PresetSwatch({ swatch }: { swatch: PresetOption["swatch"] }) {
  return (
    <span
      aria-hidden
      className="size-2.5 shrink-0 rounded-full bg-(--swatch-light) ring-1 ring-border dark:bg-(--swatch-dark)"
      style={
        {
          "--swatch-light": swatch.light,
          "--swatch-dark": swatch.dark,
        } as React.CSSProperties
      }
    />
  )
}

function PresetOptionItem({ option }: { option: PresetOption }) {
  return (
    <SelectItem value={option.value}>
      <PresetSwatch swatch={option.swatch} />
      <span className="grid min-w-0">
        <span className="truncate">{option.label}</span>
        <span className="truncate text-xs text-muted-foreground">
          {option.description}
        </span>
      </span>
    </SelectItem>
  )
}

/**
 * The page's preset, picked from one menu: Jev's (or the default before Jev
 * has read anything), whatever was pasted or shuffled, and the presets the
 * visitor has saved. A preset picked here sticks across new descriptions:
 * the page changes, the theme does not.
 */
function PresetControl({
  jevCode,
  override,
  onOverride,
}: {
  jevCode: string | undefined
  override: string | undefined
  onOverride: (code: string | undefined) => void
}) {
  const [draft, setDraft] = useState("")
  const parsed = parsePresetInput(draft)
  const authStatus = useAuthStore((state) => state.status)
  const myPresets = useMyPresets()

  const baseCode = jevCode ?? DEFAULT_PRESET
  const current = override ?? baseCode
  const suggested = [presetOption(baseCode)]
  if (override && override !== baseCode)
    suggested.unshift(presetOption(override))
  const saved = (myPresets.data?.items ?? [])
    .map((item) => presetOption(item.code))
    .filter((option): option is PresetOption => option !== null)
  const suggestedOptions = suggested
    .filter((option): option is PresetOption => option !== null)
    // A saved preset shows once, under Saved.
    .filter((option) => !saved.some((s) => s.value === option.value))
  const options = [...suggestedOptions, ...saved]
  const currentOption = options.find((option) => option.value === current)

  function pick(code: string) {
    onOverride(code === baseCode ? undefined : code)
  }

  function apply() {
    if (!parsed) return
    pick(parsed)
    setDraft("")
  }

  return (
    <div className="grid gap-2">
      <Select
        items={options.map(({ value, label }) => ({ value, label }))}
        value={current}
        onValueChange={(code: string | null) => {
          if (code) pick(code)
        }}
      >
        <SelectTrigger
          aria-label="Preset"
          className="h-auto min-h-9 w-full bg-background text-xs"
        >
          {currentOption ? (
            <PresetSwatch swatch={currentOption.swatch} />
          ) : null}
          <SelectValue className="truncate" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {suggestedOptions.length ? (
            <SelectGroup>
              <SelectLabel>{jevCode ? "This page" : "Default"}</SelectLabel>
              {suggestedOptions.map((option) => (
                <PresetOptionItem key={option.value} option={option} />
              ))}
            </SelectGroup>
          ) : null}
          {saved.length ? (
            <SelectGroup>
              <SelectLabel>Saved</SelectLabel>
              {saved.map((option) => (
                <PresetOptionItem key={option.value} option={option} />
              ))}
            </SelectGroup>
          ) : null}
        </SelectContent>
      </Select>

      <SavedPresetsHint
        authStatus={authStatus}
        loading={myPresets.isLoading}
        failed={myPresets.isError}
        count={saved.length}
      />

      <form
        className="grid gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          apply()
        }}
      >
        <InputGroup className="h-8 bg-background">
          <InputGroupInput
            aria-label="Preset code"
            placeholder="Paste a preset code"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-invalid={draft.trim() !== "" && !parsed}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton type="submit" size="xs" disabled={!parsed}>
              Apply
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => pick(generateRandomCompatiblePreset())}
        >
          <ShuffleIcon data-icon="inline-start" />
          Shuffle
        </Button>
        {override ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onOverride(undefined)}
          >
            <ArrowCounterClockwiseIcon data-icon="inline-start" />
            {jevCode ? "Use Jev's" : "Use default"}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

/** Where saved presets are, when they are not in the menu. */
function SavedPresetsHint({
  authStatus,
  loading,
  failed,
  count,
}: {
  authStatus: string
  loading: boolean
  failed: boolean
  count: number
}) {
  const ensureAuthenticated = useAuthStore((state) => state.ensureAuthenticated)

  if (authStatus === "unknown" || (authStatus === "authenticated" && loading)) {
    return null
  }
  if (authStatus !== "authenticated") {
    return (
      <p className="text-xs text-muted-foreground">
        <button
          type="button"
          className="underline underline-offset-4 hover:text-foreground"
          onClick={() => void ensureAuthenticated()}
        >
          Sign in
        </button>{" "}
        to use presets you have saved.
      </p>
    )
  }
  if (failed) {
    return (
      <p className="text-xs text-destructive" role="alert">
        Could not load your saved presets.
      </p>
    )
  }
  if (count === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Presets you save show up in this menu.
      </p>
    )
  }
  return null
}
