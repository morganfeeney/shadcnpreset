"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import {
  CUSTOM_COLOURS_MESSAGE_TYPE,
  isPreviewReadyMessage,
  PRESET_CODE_MESSAGE_TYPE,
} from "@/lib/custom-preset-frame"
import type { GeneratedPreviewPayload } from "@/lib/generated-preview/messages"
import {
  GENERATED_PREVIEW_MESSAGE_TYPE,
  isGeneratedPreviewReadyMessage,
} from "@/lib/generated-preview/messages"

const THEME_SYNC_MESSAGE_TYPE = "shadcnpreset:theme-mode"

type ThemeMode = "light" | "dark"

const FRAME_SANDBOX = "allow-scripts allow-same-origin"

type PresetV4FrameProps = {
  src: string
  title: string
  className?: string
  generatedPreview?: GeneratedPreviewPayload | null
  /** A custom preset's colours, sent in as they change rather than reloading. */
  customColoursCss?: string
  /** Its preset code (style, fonts, icons), sent in the same way. */
  presetCode?: string
} & Omit<
  React.ComponentPropsWithoutRef<"iframe">,
  "src" | "title" | "className" | "onLoad" | "sandbox"
> & {
  onLoad?: React.ComponentPropsWithoutRef<"iframe">["onLoad"]
}

export function PresetV4Frame({
  src,
  title,
  className,
  onLoad,
  generatedPreview,
  customColoursCss,
  presetCode,
  ...props
}: PresetV4FrameProps) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const hasLoadedRef = React.useRef(false)
  const [activeSrc, setActiveSrc] = React.useState<string | null>(null)
  const { resolvedTheme } = useTheme()
  const retryTimersRef = React.useRef<number[]>([])

  React.useEffect(() => {
    // Reset before the new src renders: a cached page can load before any
    // later effect runs, and resetting after would undo its load for good.
    hasLoadedRef.current = false
    setActiveSrc(src)
  }, [src])

  const targetOrigin = React.useMemo(() => {
    try {
      // Local previews use a relative path; resolve it so generated code is
      // posted to an explicit origin rather than broadcast with "*".
      const base = typeof window === "undefined" ? undefined : window.location.href
      return new URL(src, base).origin
    } catch {
      return "*"
    }
  }, [src])

  const mode: ThemeMode = React.useMemo(
    () => (resolvedTheme === "dark" ? "dark" : "light"),
    [resolvedTheme]
  )

  const postThemeMode = React.useCallback(() => {
    const frameWindow = iframeRef.current?.contentWindow
    if (!frameWindow) {
      return
    }

    frameWindow.postMessage(
      {
        type: THEME_SYNC_MESSAGE_TYPE,
        mode,
      },
      targetOrigin
    )
  }, [mode, targetOrigin])

  const clearRetryTimers = React.useCallback(() => {
    retryTimersRef.current.forEach((id) => {
      window.clearTimeout(id)
    })
    retryTimersRef.current = []
  }, [])

  const postGeneratedPreview = React.useCallback(() => {
    const frameWindow = iframeRef.current?.contentWindow
    if (!frameWindow || !generatedPreview) {
      return
    }

    frameWindow.postMessage(
      {
        type: GENERATED_PREVIEW_MESSAGE_TYPE,
        title: generatedPreview.title,
        code: generatedPreview.code,
      },
      targetOrigin
    )
  }, [generatedPreview, targetOrigin])

  const postCustomColours = React.useCallback(() => {
    const frameWindow = iframeRef.current?.contentWindow
    if (!frameWindow) {
      return
    }
    // The code first: it replaces the preset's own theme, which the colours
    // sit over.
    if (presetCode !== undefined) {
      frameWindow.postMessage(
        { type: PRESET_CODE_MESSAGE_TYPE, code: presetCode },
        targetOrigin
      )
    }
    if (customColoursCss !== undefined) {
      frameWindow.postMessage(
        { type: CUSTOM_COLOURS_MESSAGE_TYPE, css: customColoursCss },
        targetOrigin
      )
    }
  }, [customColoursCss, presetCode, targetOrigin])

  const postThemeModeWithRetry = React.useCallback(() => {
    clearRetryTimers()
    postThemeMode()
    postGeneratedPreview()
    postCustomColours()

    // The iframe app can hydrate after load; resend for a short window to avoid races.
    retryTimersRef.current = [200, 800].map((delay) =>
      window.setTimeout(() => {
        postThemeMode()
        postGeneratedPreview()
        postCustomColours()
      }, delay)
    )
  }, [clearRetryTimers, postCustomColours, postGeneratedPreview, postThemeMode])

  React.useEffect(() => {
    if (!hasLoadedRef.current) {
      return
    }

    postThemeMode()
  }, [postThemeMode])

  React.useEffect(() => {
    if (!hasLoadedRef.current) {
      return
    }
    postGeneratedPreview()
  }, [postGeneratedPreview])

  React.useEffect(() => {
    if (!hasLoadedRef.current) {
      return
    }
    postCustomColours()
  }, [postCustomColours])

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (iframeRef.current?.contentWindow !== event.source) {
        return
      }
      // The frame says when it listens: everything goes in then, whatever
      // the load event did or didn't catch.
      if (isPreviewReadyMessage(event.data)) {
        hasLoadedRef.current = true
        postThemeMode()
        postGeneratedPreview()
        postCustomColours()
        return
      }
      if (isGeneratedPreviewReadyMessage(event.data)) {
        postGeneratedPreview()
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [postCustomColours, postGeneratedPreview, postThemeMode])

  React.useEffect(() => {
    return () => {
      clearRetryTimers()
      const frame = iframeRef.current
      if (frame) {
        // Encourage quicker memory reclamation on route changes/unmount.
        frame.src = "about:blank"
      }
    }
  }, [clearRetryTimers])

  if (!activeSrc) {
    return <div className={className} aria-hidden />
  }

  return (
    <iframe
      ref={iframeRef}
      className={className}
      src={activeSrc}
      title={title}
      sandbox={FRAME_SANDBOX}
      onLoad={(event) => {
        const loadedSrc = event.currentTarget.src
        if (!loadedSrc || loadedSrc === "about:blank") return
        hasLoadedRef.current = true
        postThemeModeWithRetry()
        onLoad?.(event)
      }}
      {...props}
    />
  )
}
