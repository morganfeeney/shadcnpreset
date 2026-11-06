"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "@phosphor-icons/react"
import { ChevronDownIcon, LinkIcon } from "lucide-react"
import { toast } from "sonner"

import { CustomPresetProperties } from "@/components/custom-presets/custom-preset-properties"
import { PresetV4Frame } from "@/components/preset-v4-frame"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import type { CustomColours } from "@/lib/custom-colours"
import {
  buildCustomPreset,
  customPresetPath,
  customPresetRegistryPath,
  installablePresetCode,
} from "@/lib/custom-preset"
import {
  CUSTOM_PRESET_VIEWS,
  customPresetPreviewSrc,
  type CustomPresetView,
} from "@/lib/custom-preset-frame"
import { trackEvent } from "@/lib/analytics-events"
import { cn } from "@/lib/utils"

const SHADCN = process.env.NEXT_PUBLIC_RC ? "shadcn@rc" : "shadcn@latest"

/** How long a dragged picker rests before its colour is saved. */
const SAVE_DELAY_MS = 400

type Draft = { code: string; colours: CustomColours }

/**
 * A custom preset to work on: create's preview in its colours, and a column
 * of everything to change beside it. Changes save as they are made, so the
 * install link always gives what is on screen; only the person who made it
 * can change anything. `start` and `end` go either side of its bar, for the
 * panel's way back to the chat and its close button.
 */
export function CustomPresetEditor({
  id,
  initialCode,
  colours: initialColours,
  canEdit,
  origin,
  start,
  end,
}: {
  id: string
  initialCode: string
  colours: CustomColours
  canEdit: boolean
  origin: string
  start?: React.ReactNode
  end?: React.ReactNode
}) {
  const [draft, setDraft] = React.useState<Draft>({
    code: initialCode,
    colours: initialColours,
  })
  const { code, colours } = draft
  const preset = React.useMemo(
    () => buildCustomPreset(code, colours),
    [code, colours]
  )

  // An edit from elsewhere (the chat) replaces what is on screen, in place.
  const [given, setGiven] = React.useState<Draft>(draft)
  if (given.code !== initialCode || given.colours !== initialColours) {
    const next = { code: initialCode, colours: initialColours }
    setGiven(next)
    setDraft(next)
  }

  // What the server last accepted, to go back to when a save fails. An edit
  // that arrives is already saved, and wins over a drag still waiting to be.
  const saved = React.useRef(draft)
  const pendingSave = React.useRef<number | undefined>(undefined)
  React.useEffect(() => {
    window.clearTimeout(pendingSave.current)
    saved.current = given
  }, [given])
  React.useEffect(() => () => window.clearTimeout(pendingSave.current), [])

  function update(next: Draft, settle = true) {
    setDraft(next)
    window.clearTimeout(pendingSave.current)
    // A picker being dragged waits; anything else saves at once.
    if (settle) void save(next)
    else
      pendingSave.current = window.setTimeout(
        () => void save(next),
        SAVE_DELAY_MS
      )
  }

  async function save(next: Draft) {
    const response = await fetch(`/api/custom-presets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presetCode: next.code, colours: next.colours }),
    }).catch(() => null)
    if (response?.ok) {
      saved.current = next
      return
    }
    setDraft(saved.current)
    toast.error("That change didn’t save. Try again in a moment.")
  }

  if (!preset) return null
  const { colours: theme } = preset

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-2 lg:px-3">
        {start}
        <span
          aria-hidden
          className="size-3 shrink-0 rounded-sm"
          style={{ background: theme.light.primary }}
        />
        <h2 className="truncate text-sm font-semibold">
          {canEdit ? "Your custom preset" : "Custom preset"}
        </h2>
        <code className="hidden font-mono text-xs text-muted-foreground sm:inline">
          {code}
        </code>
        <span className="flex-1" />
        <ShareButton url={`${origin}${customPresetPath(id)}`} />
        <InstallMenu
          code={installablePresetCode(code)}
          css={preset.css}
          registryUrl={`${origin}${customPresetRegistryPath(id)}`}
        />
        {end}
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <PreviewCanvas id={id} code={code} css={preset.css} />

        <aside
          aria-label="Customise"
          className="shrink-0 border-t lg:w-72 lg:overflow-y-auto lg:overscroll-contain lg:border-t-0 lg:border-l"
        >
          <CustomPresetProperties
            code={code}
            colours={colours}
            canEdit={canEdit}
            onValueChange={update}
          />
        </aside>
      </div>
    </div>
  )
}

/**
 * Create's preview of the preset. It loads once per view; after that every
 * change, its code (style, fonts, icons) and its colours alike, is sent in
 * and shown in place.
 */
function PreviewCanvas({
  id,
  code,
  css,
}: {
  id: string
  code: string
  css: string
}) {
  const [view, setView] = React.useState<CustomPresetView>("preview")
  // The code the frame first loads with, kept until the view changes.
  const [loaded, setLoaded] = React.useState({ view, code })
  if (loaded.view !== view) setLoaded({ view, code })
  const src = customPresetPreviewSrc(view, loaded.code, id)
  // Shown once it has taken the site's mode, which arrives after it loads:
  // until then it paints light, a flash on every change of style or font.
  const [shownSrc, setShownSrc] = React.useState<string | null>(null)
  const shown = shownSrc === src

  return (
    <div className="relative h-[70svh] shrink-0 bg-muted p-3 lg:h-auto lg:min-h-0 lg:flex-1 lg:p-5">
      <PresetV4Frame
        src={src}
        title="Your custom preset in create's preview"
        customColoursCss={css}
        presetCode={code}
        className={cn(
          "block size-full rounded-lg border bg-background shadow-lg transition-opacity duration-150",
          !shown && "opacity-0"
        )}
        onLoad={() => window.setTimeout(() => setShownSrc(src), 250)}
      />
      {shown ? null : (
        <div className="absolute inset-0 grid place-items-center">
          <Spinner />
        </div>
      )}
      <div
        role="toolbar"
        aria-label="Preview"
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-0.5 rounded-lg border bg-popover p-1 shadow-md lg:bottom-8"
      >
        {CUSTOM_PRESET_VIEWS.map(({ example, label }) => (
          <Button
            key={example}
            type="button"
            size="sm"
            variant={view === example ? "secondary" : "ghost"}
            aria-pressed={view === example}
            onClick={() => setView(example)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}

function ShareButton({ url }: { url: string }) {
  const { isCopied, copyToClipboard } = useCopyToClipboard()
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        void copyToClipboard(url)
        trackEvent("custom_preset_share", {})
      }}
    >
      {isCopied ? (
        <CheckIcon data-icon="inline-start" />
      ) : (
        <LinkIcon data-icon="inline-start" />
      )}
      {isCopied ? "Copied" : "Share"}
    </Button>
  )
}

/**
 * Two steps: the preset itself (a preset code holds everything but exact
 * colours), then the colours from this preset's registry item.
 */
function InstallMenu({
  code,
  css,
  registryUrl,
}: {
  code: string
  css: string
  registryUrl: string
}) {
  return (
    <Popover>
      <PopoverTrigger render={<Button type="button" size="sm" />}>
        Install
        <ChevronDownIcon data-icon="inline-end" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        aria-label="Install this preset"
        className="grid w-[min(28rem,calc(100vw-2rem))] grid-cols-1 gap-4 p-4"
      >
        <div className="grid grid-cols-1 gap-2">
          <h3 className="text-sm font-medium">1. Set up the preset</h3>
          <Tabs defaultValue="new">
            <TabsList>
              <TabsTrigger value="new">New project</TabsTrigger>
              <TabsTrigger value="existing">Existing project</TabsTrigger>
            </TabsList>
            <TabsContent value="new">
              <CopyableCode label="Copy the new project command">
                {`npx ${SHADCN} init --preset ${code}`}
              </CopyableCode>
            </TabsContent>
            <TabsContent value="existing">
              <CopyableCode label="Copy the existing project command">
                {`npx ${SHADCN} apply --preset ${code}`}
              </CopyableCode>
            </TabsContent>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <h3 className="text-sm font-medium">2. Add your colours</h3>
          <p className="text-xs text-muted-foreground">
            A preset code can’t hold exact colours, so they install from this
            link. Anyone with it can use them.
          </p>
          <CopyableCode label="Copy the colours command">
            {`npx ${SHADCN} add ${registryUrl}`}
          </CopyableCode>
        </div>

        <details className="grid grid-cols-1 gap-2">
          <summary className="cursor-pointer text-sm font-medium">
            Colours only, as CSS
          </summary>
          <p className="pt-2 text-xs text-muted-foreground">
            Already on this preset? Replace the <code>:root</code> and{" "}
            <code>.dark</code> blocks in your <code>globals.css</code>.
          </p>
          <CopyableCode label="Copy the CSS" block className="mt-2">
            {css}
          </CopyableCode>
        </details>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Code to copy, with its copy button in the corner: a one-line command, or
 * (`block`) a stylesheet that scrolls. A command longer than its box fades
 * out before the button, and its end clears the fade once scrolled to.
 */
function CopyableCode({
  children,
  label,
  block = false,
  className,
}: {
  children: string
  label: string
  block?: boolean
  className?: string
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard()
  return (
    <div className={cn("relative rounded-lg border bg-muted/40", className)}>
      <pre
        className={cn(
          "overflow-x-auto p-3 font-mono text-xs",
          block
            ? "max-h-72 overflow-y-auto pr-12 leading-relaxed"
            : "mask-[linear-gradient(to_right,black_calc(100%-4.5rem),transparent_calc(100%-2.75rem))] pr-20"
        )}
      >
        {children}
      </pre>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-foreground"
        aria-label={isCopied ? "Copied" : label}
        onClick={() => void copyToClipboard(children)}
      >
        {isCopied ? (
          <CheckIcon aria-hidden className="size-4" />
        ) : (
          <CopyIcon aria-hidden className="size-4" />
        )}
      </Button>
    </div>
  )
}
