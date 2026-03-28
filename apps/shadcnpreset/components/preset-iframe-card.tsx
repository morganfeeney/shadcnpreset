"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

type PresetIframeCardProps = {
  code: string
  title: string
  description: string
  virtualWidth?: number
  virtualHeight?: number
}

export function PresetIframeCard({
  code,
  title,
  description,
  virtualWidth = 700,
  virtualHeight = 920,
}: PresetIframeCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const node = wrapperRef.current
    if (!node) return

    const resizeObserver = new ResizeObserver((entries) => {
      const [entry] = entries
      if (entry) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    resizeObserver.observe(node)

    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    const node = wrapperRef.current
    if (!node) return

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting)
        if (isVisible) {
          setShouldLoad(true)
          intersectionObserver.disconnect()
        }
      },
      { rootMargin: "220px 0px" }
    )
    intersectionObserver.observe(node)

    return () => intersectionObserver.disconnect()
  }, [])

  const scale = useMemo(() => {
    if (!containerWidth) return 0.001
    return containerWidth / virtualWidth
  }, [containerWidth, virtualWidth])
  const scaledHeight = Math.max(180, Math.round(virtualHeight * scale))

  return (
    <article className="overflow-hidden rounded-xl border bg-card/60">
      <div
        ref={wrapperRef}
        className="relative w-full overflow-hidden border-b bg-background/90"
        style={{ height: scaledHeight }}
      >
        {shouldLoad ? (
          <div
            className="absolute top-0 left-0 will-change-transform"
            style={{
              width: virtualWidth,
              height: virtualHeight,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <iframe
              title={`Preset preview ${code}`}
              src={`/preset/${code}?embed=1`}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin"
              className="h-full w-full border-0"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Loading preview...
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <Link
          href={`/preset/${code}`}
          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border bg-background px-2 text-xs font-medium hover:bg-muted/50"
        >
          Open
          <ExternalLink className="size-3" />
        </Link>
      </div>
    </article>
  )
}
