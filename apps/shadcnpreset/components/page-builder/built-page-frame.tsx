"use client"

import { useEffect, useRef, useState } from "react"

import { PresetV4Frame } from "@/components/preset-v4-frame"
import { Spinner } from "@/components/ui/spinner"
import {
  isPageBuilderReadyMessage,
  PAGE_BUILDER_BLOCKS_MESSAGE_TYPE,
} from "@/lib/page-builder/messages"
import { PAGE_KIND_LABELS, type PageKind } from "@/lib/page-builder/sections"
import { cn } from "@/lib/utils"

function frameSrc(preset: string, kind: PageKind, blocks: string[]) {
  const params = new URLSearchParams({
    preset,
    kind,
    blocks: blocks.join(","),
  })
  return `/preset-preview/builder?${params}`
}

/**
 * The page in its own frame. Only a new preset reloads it — the preset's CSS
 * is rendered on the server. Layout changes are posted into the loaded frame,
 * so dragging a block costs a repaint.
 *
 * The frame says when it is listening, and gets the current layout in reply.
 * Until then nothing is posted: a message sent any earlier — on the iframe's
 * load event, say — can arrive before the frame's blocks mount, and a reload
 * would leave it on the stale layout in its URL.
 */
export function BuiltPageFrame({
  preset,
  kind,
  blocks,
  dimmed,
}: {
  preset: string
  kind: PageKind
  blocks: string[]
  dimmed: boolean
}) {
  const frameWindowRef = useRef<Window | null>(null)
  const layoutRef = useRef({ kind, blocks })
  const [ready, setReady] = useState(false)
  // The URL is fixed per preset; the frame starts from whatever layout it
  // carries and asks for the current one when it is listening.
  const [frame, setFrame] = useState({
    preset,
    src: frameSrc(preset, kind, blocks),
  })
  if (frame.preset !== preset) {
    setFrame({ preset, src: frameSrc(preset, kind, blocks) })
  }

  const layoutKey = `${kind}|${blocks.join(",")}`
  useEffect(() => {
    layoutRef.current = { kind, blocks }
    frameWindowRef.current?.postMessage(
      { type: PAGE_BUILDER_BLOCKS_MESSAGE_TYPE, kind, blocks },
      window.location.origin
    )
    // layoutKey stands in for `blocks`, a new array every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutKey])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (!isPageBuilderReadyMessage(event.data)) return
      const frameWindow = event.source as Window | null
      if (!frameWindow) return
      frameWindowRef.current = frameWindow
      frameWindow.postMessage(
        { type: PAGE_BUILDER_BLOCKS_MESSAGE_TYPE, ...layoutRef.current },
        window.location.origin
      )
      setReady(true)
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  return (
    <>
      <PresetV4Frame
        className={cn(
          "block h-full w-full border-0 transition-opacity",
          dimmed && "opacity-60"
        )}
        src={frame.src}
        title={`${PAGE_KIND_LABELS[kind]} preview`}
      />
      {ready ? null : (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <Spinner />
        </div>
      )}
    </>
  )
}
