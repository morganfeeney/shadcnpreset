"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { usePresetPageLiveOptional } from "@/components/preset-page-live-context"
import { usePresetParentUrlSync } from "@/hooks/use-preset-parent-url-sync"
import type { GeneratedPreviewPayload } from "@/lib/generated-preview/messages"
import {
  GENERATED_PREVIEW_MESSAGE_TYPE,
  isGeneratedPreviewReadyMessage,
} from "@/lib/generated-preview/messages"

const THEME_SYNC_MESSAGE_TYPE = "shadcnpreset:theme-mode"

type ThemeMode = "light" | "dark"

type PresetV4FrameProps = {
  src: string
  title: string
  className?: string
  generatedPreview?: GeneratedPreviewPayload | null
} & Omit<
  React.ComponentPropsWithoutRef<"iframe">,
  "src" | "title" | "className" | "onLoad"
> & {
  onLoad?: React.ComponentPropsWithoutRef<"iframe">["onLoad"]
}

export function PresetV4Frame({
  src,
  title,
  className,
  onLoad,
  generatedPreview,
  ...props
}: PresetV4FrameProps) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const hasLoadedRef = React.useRef(false)
  const [activeSrc, setActiveSrc] = React.useState<string | null>(null)
  const live = usePresetPageLiveOptional()
  const { resolvedTheme } = useTheme()
  const retryTimersRef = React.useRef<number[]>([])

  usePresetParentUrlSync(iframeRef, live?.onPresetFromIframe)

  React.useEffect(() => {
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

  const postThemeModeWithRetry = React.useCallback(() => {
    clearRetryTimers()
    postThemeMode()
    postGeneratedPreview()

    // The iframe app can hydrate after load; resend for a short window to avoid races.
    retryTimersRef.current = [200, 800].map((delay) =>
      window.setTimeout(() => {
        postThemeMode()
        postGeneratedPreview()
      }, delay)
    )
  }, [clearRetryTimers, postGeneratedPreview, postThemeMode])

  React.useEffect(() => {
    hasLoadedRef.current = false
  }, [activeSrc])

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
    const handleMessage = (event: MessageEvent) => {
      if (iframeRef.current?.contentWindow !== event.source) {
        return
      }
      if (!isGeneratedPreviewReadyMessage(event.data)) {
        return
      }
      postGeneratedPreview()
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [postGeneratedPreview])

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
