"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"

import { PreviewPresetProvider } from "@/components/shadcn-examples/preview-preset"
import { Spinner } from "@/components/ui/spinner"
import {
  CUSTOM_COLOURS_STYLE_ID,
  isCustomColoursMessage,
  isPresetCodeMessage,
  PREVIEW_READY_MESSAGE_TYPE,
  PRESET_THEME_STYLE_ID,
} from "@/lib/custom-preset-frame"
import { effectiveHeadingFont } from "@/lib/preset"
import { getPresetGoogleFontStylesheetHrefs } from "@/lib/preset-google-fonts"
import { getPresetThemeCssBundle } from "@/lib/preset-theme-css"
import type { BuiltPageSpec } from "@/lib/page-builder/messages"
import type { LocalPresetPreviewExample } from "@/lib/preset-preview"

function ExampleLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <Spinner />
    </div>
  )
}

// Each frame renders one example, so each is its own chunk: a Login frame
// should not download the Store, Marketing or chart code.
const PreviewDemo = dynamic(
  () => import("@/components/shadcn-examples/preview"),
  { loading: ExampleLoading }
)
const Preview02Demo = dynamic(
  () => import("@/components/shadcn-examples/preview-02"),
  { loading: ExampleLoading }
)
const DashboardDemo = dynamic(
  () => import("@/components/shadcn-examples/dashboard"),
  { loading: ExampleLoading }
)
const Login02Demo = dynamic(
  () =>
    import("@/components/shadcn-examples/login-02").then(
      (mod) => mod.Login02Demo
    ),
  { loading: ExampleLoading }
)
const Login04Demo = dynamic(
  () =>
    import("@/components/shadcn-examples/login-04").then(
      (mod) => mod.Login04Demo
    ),
  { loading: ExampleLoading }
)
const MarketingDemo = dynamic(
  () =>
    import("@/components/shadcncraft-examples/marketing").then(
      (mod) => mod.MarketingDemo
    ),
  { loading: ExampleLoading }
)
const ApplicationDemo = dynamic(
  () =>
    import("@/components/shadcncraft-examples/application").then(
      (mod) => mod.ApplicationDemo
    ),
  { loading: ExampleLoading }
)
const StoreDemo = dynamic(
  () =>
    import("@/components/shadcncraft-examples/store").then(
      (mod) => mod.StoreDemo
    ),
  { loading: ExampleLoading }
)
const ChatDemo = dynamic(
  () =>
    import("@/components/shadcncraft-examples/chat").then(
      (mod) => mod.ChatDemo
    ),
  { loading: ExampleLoading }
)
const GeneratedPreviewExample = dynamic(
  () =>
    import("@/components/generated-preview/example").then(
      (mod) => mod.GeneratedPreviewExample
    ),
  { ssr: false, loading: ExampleLoading }
)

const BuiltPage = dynamic(
  () =>
    import("@/components/page-builder/built-page").then((mod) => mod.BuiltPage),
  { loading: ExampleLoading }
)

const THEME_SYNC_MESSAGE_TYPE = "shadcnpreset:theme-mode"
const FONT_READY_FALLBACK_MS = 5000

type ThemeMode = "light" | "dark"

type ThemeModeMessage = {
  type: typeof THEME_SYNC_MESSAGE_TYPE
  mode: ThemeMode
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark"
}

function isThemeModeMessage(value: unknown): value is ThemeModeMessage {
  if (!value || typeof value !== "object") {
    return false
  }
  const candidate = value as Record<string, unknown>
  return (
    candidate.type === THEME_SYNC_MESSAGE_TYPE && isThemeMode(candidate.mode)
  )
}

function ExampleView({
  slug,
  presetCode,
  builtPage,
}: {
  slug: LocalPresetPreviewExample
  presetCode: string
  builtPage?: BuiltPageSpec
}) {
  switch (slug) {
    case "preview":
      return (
        <PreviewPresetProvider code={presetCode}>
          <div className="relative bg-background text-foreground">
            <PreviewDemo />
          </div>
        </PreviewPresetProvider>
      )
    case "preview-02":
      return (
        <PreviewPresetProvider code={presetCode}>
          <div className="relative bg-background text-foreground">
            <Preview02Demo />
          </div>
        </PreviewPresetProvider>
      )
    case "dashboard":
      return (
        <div className="min-h-svh bg-background text-foreground">
          <DashboardDemo />
        </div>
      )
    case "login-02":
      return (
        <div className="min-h-svh bg-background text-foreground">
          <Login02Demo />
        </div>
      )
    case "login-04":
      return (
        <div className="min-h-svh bg-background text-foreground">
          <Login04Demo />
        </div>
      )
    case "marketing":
      return (
        <div className="min-h-svh bg-background text-foreground">
          <MarketingDemo />
        </div>
      )
    case "application":
      // The app shell sizes itself to the frame and scrolls inside, so it gets
      // the viewport height rather than a page that grows.
      return (
        <div className="h-svh bg-background text-foreground">
          <ApplicationDemo />
        </div>
      )
    case "store":
      return (
        <div className="min-h-svh bg-background text-foreground">
          <StoreDemo />
        </div>
      )
    case "chat":
      return <ChatDemo />
    case "generated":
      return <GeneratedPreviewExample />
    case "builder":
      return builtPage ? <BuiltPage {...builtPage} /> : null
    default:
      return null
  }
}

export function PresetPreviewExampleShell({
  slug,
  presetCode,
  builtPage,
  fontReadyGateKey,
  bodyStyleClass,
  bodyBaseColorClass,
}: {
  slug: LocalPresetPreviewExample
  presetCode: string
  /** The page builder's layout, read from the frame's URL. */
  builtPage?: BuiltPageSpec
  /**
   * When non-empty, blocks the example until `document.fonts.ready` (or timeout),
   * matching v4 DesignSystemProvider + preset iframe behavior. Value should
   * change when the embedded Google font set changes.
   */
  fontReadyGateKey: string
  /** Mirror preset scope on `document.body` so portaled UI (e.g. Vaul drawer) still matches `.style-* .cn-*`. */
  bodyStyleClass: string
  bodyBaseColorClass: string
}) {
  const { setTheme } = useTheme()

  const [contentReady, setContentReady] = React.useState(
    () => fontReadyGateKey.length === 0
  )

  // The custom preset editor sends a new code as its style, fonts or icons
  // change, shown here in place rather than by loading the page again.
  // A code sent by the page, once one is: the page's own again included, so
  // going back to it puts its theme back.
  const [code, setCode] = React.useState<string | null>(null)
  const live = React.useMemo(
    () => (code === null ? null : getPresetThemeCssBundle(code)),
    [code]
  )
  const styleClass = live ? `style-${live.resolved.style}` : bodyStyleClass
  const baseColorClass = live
    ? `base-color-${live.resolved.baseColor}`
    : bodyBaseColorClass

  React.useLayoutEffect(() => {
    const body = document.body
    body.classList.add(styleClass, baseColorClass)
    return () => {
      body.classList.remove(styleClass, baseColorClass)
    }
  }, [styleClass, baseColorClass])

  React.useLayoutEffect(() => {
    if (!live) return
    const theme = document.getElementById(PRESET_THEME_STYLE_ID)
    if (theme) theme.textContent = live.combinedCss
    const root = document.querySelector(".preset-preview-root")
    if (root) {
      for (const name of [...root.classList]) {
        if (name.startsWith("style-") || name.startsWith("base-color-")) {
          root.classList.remove(name)
        }
      }
      root.classList.add(styleClass, baseColorClass)
    }
    const { font, fontHeading } = live.resolved
    const loaded = [...document.querySelectorAll("link[rel=stylesheet]")].map(
      (link) => link.getAttribute("href")
    )
    for (const href of getPresetGoogleFontStylesheetHrefs([
      font,
      effectiveHeadingFont(font, fontHeading),
    ])) {
      if (loaded.includes(href)) continue
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = href
      document.head.append(link)
    }
    // The icons read the preset from the address.
    const url = new URL(window.location.href)
    url.searchParams.set("preset", live.resolved.code)
    // Next only syncs the address into useSearchParams for state it didn't write.
    window.history.replaceState(null, "", url)
  }, [live, styleClass, baseColorClass])

  React.useLayoutEffect(() => {
    if (fontReadyGateKey.length === 0) {
      setContentReady(true)
      return
    }

    setContentReady(false)
    let cancelled = false
    const fallbackId = window.setTimeout(() => {
      if (!cancelled) setContentReady(true)
    }, FONT_READY_FALLBACK_MS)

    void document.fonts.ready.then(() => {
      if (!cancelled) setContentReady(true)
    })

    return () => {
      cancelled = true
      window.clearTimeout(fallbackId)
    }
  }, [fontReadyGateKey])

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Colours and codes only from this site's own pages: the custom
      // preset editor.
      if (event.origin === window.location.origin) {
        if (isCustomColoursMessage(event.data)) {
          const style = document.getElementById(CUSTOM_COLOURS_STYLE_ID)
          if (style) style.textContent = event.data.css
          return
        }
        if (isPresetCodeMessage(event.data)) {
          if (getPresetThemeCssBundle(event.data.code)) setCode(event.data.code)
          return
        }
      }
      if (!isThemeModeMessage(event.data)) {
        return
      }
      setTheme(event.data.mode)
    }
    window.addEventListener("message", handleMessage)
    // Listening now: the page that framed this sends what it has.
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: PREVIEW_READY_MESSAGE_TYPE },
        window.location.origin
      )
    }
    return () => window.removeEventListener("message", handleMessage)
  }, [setTheme])

  if (!contentReady) {
    return <ExampleLoading />
  }

  return (
    <ExampleView
      slug={slug}
      presetCode={live ? live.resolved.code : presetCode}
      builtPage={builtPage}
    />
  )
}
