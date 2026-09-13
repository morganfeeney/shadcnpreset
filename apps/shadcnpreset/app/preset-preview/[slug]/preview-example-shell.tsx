"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"

import { Spinner } from "@/components/ui/spinner"
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
}: {
  slug: LocalPresetPreviewExample
  presetCode: string
}) {
  switch (slug) {
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
      return (
        <div className="min-h-svh bg-background text-foreground">
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
    default:
      return null
  }
}

export function PresetPreviewExampleShell({
  slug,
  presetCode,
  fontReadyGateKey,
  bodyStyleClass,
  bodyBaseColorClass,
}: {
  slug: LocalPresetPreviewExample
  presetCode: string
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

  React.useLayoutEffect(() => {
    const body = document.body
    body.classList.add(bodyStyleClass, bodyBaseColorClass)
    return () => {
      body.classList.remove(bodyStyleClass, bodyBaseColorClass)
    }
  }, [bodyStyleClass, bodyBaseColorClass])

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
      if (!isThemeModeMessage(event.data)) {
        return
      }
      setTheme(event.data.mode)
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [setTheme])

  if (!contentReady) {
    return <ExampleLoading />
  }

  return <ExampleView slug={slug} presetCode={presetCode} />
}
