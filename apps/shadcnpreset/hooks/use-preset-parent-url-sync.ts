"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { isPresetCode } from "shadcn/preset"

import { parsePresetCodeFromPathname } from "@/lib/preset-route"
import { SHADCNPRESET_PRESET_CODE_MESSAGE_TYPE } from "@/lib/shadcnpreset-postmessage"

/**
 * When the v4 create iframe posts a new preset code, update `/preset/[code]` on the host.
 * Pass the same ref `PresetV4Frame` uses for the iframe so only that frame’s messages apply.
 *
 * When `onPresetFromIframe` is set (preset page + `PresetPageLiveProvider`), the URL is updated
 * with `history.replaceState` so the document and iframe do not reload. Otherwise falls back to
 * `router.replace` (legacy / rare).
 */
export function usePresetParentUrlSync(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  onPresetFromIframe?: ((preset: string) => void) | null
) {
  const router = useRouter()

  const onPresetRef = React.useRef(onPresetFromIframe)
  React.useEffect(() => {
    onPresetRef.current = onPresetFromIframe
  }, [onPresetFromIframe])

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || event.data.type !== SHADCNPRESET_PRESET_CODE_MESSAGE_TYPE) {
        return
      }

      if (iframeRef.current?.contentWindow !== event.source) {
        return
      }

      const preset = event.data.preset
      if (typeof preset !== "string" || !isPresetCode(preset)) {
        return
      }

      const routeCode = parsePresetCodeFromPathname(window.location.pathname)
      if (routeCode === null || preset === routeCode) {
        return
      }

      const cb = onPresetRef.current
      if (cb) {
        cb(preset)
        return
      }

      router.replace(`/preset/${encodeURIComponent(preset)}`)
    }

    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [iframeRef, router])
}
