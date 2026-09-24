"use client"

import { useEffect, useRef, useState } from "react"

import { PresetV4Frame } from "@/components/preset-v4-frame"
import { Spinner } from "@/components/ui/spinner"
import {
  builtPageSrc,
  isPageBuilderReadyMessage,
  pageBuilderBlocksMessage,
  readPageBuilderEditMessage,
  type BuiltPageSpec,
  type PageEdit,
} from "@/lib/page-builder/messages"
import { LAYOUT_SLOTS } from "@/lib/page-builder/sections"
import { cn } from "@/lib/utils"

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
  spec,
  dimmed,
  onEdit,
}: {
  preset: string
  spec: BuiltPageSpec
  dimmed: boolean
  /** An edit the visitor made on the page itself, from a block's toolbar. */
  onEdit: (edit: PageEdit) => void
}) {
  const frameWindowRef = useRef<Window | null>(null)
  const specRef = useRef(spec)
  const [ready, setReady] = useState(false)
  // The URL is fixed per preset; the frame starts from whatever layout it
  // carries and asks for the current one when it is listening.
  const [frame, setFrame] = useState({
    preset,
    src: builtPageSrc(preset, spec),
  })
  if (frame.preset !== preset) {
    setFrame({ preset, src: builtPageSrc(preset, spec) })
  }

  const specKey = [
    spec.blocks.join(","),
    ...LAYOUT_SLOTS.map((slot) => spec.layout[slot]),
  ].join("|")
  useEffect(() => {
    specRef.current = spec
    frameWindowRef.current?.postMessage(
      pageBuilderBlocksMessage(spec),
      window.location.origin
    )
    // specKey stands in for `spec`, a new object every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specKey])

  const onEditRef = useRef(onEdit)
  useEffect(() => {
    onEditRef.current = onEdit
  })

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      const edit = readPageBuilderEditMessage(event.data)
      if (edit) {
        // Only the frame that said it was ready can edit the page.
        if (event.source === frameWindowRef.current) onEditRef.current(edit)
        return
      }
      if (!isPageBuilderReadyMessage(event.data)) return
      const frameWindow = event.source as Window | null
      if (!frameWindow) return
      frameWindowRef.current = frameWindow
      frameWindow.postMessage(
        pageBuilderBlocksMessage(specRef.current),
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
        title="Page preview"
      />
      {ready ? null : (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <Spinner />
        </div>
      )}
    </>
  )
}
