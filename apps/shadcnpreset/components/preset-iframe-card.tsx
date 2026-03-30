"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

import useVote from "@/hooks/use-vote"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button, buttonVariants } from "@/components/ui/button"

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
  virtualHeight = 575,
}: PresetIframeCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [shouldRender, setShouldRender] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const isMobile = useIsMobile()

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
        if (!isVisible) {
          setIframeLoaded(false)
        }
        setShouldRender(isVisible)
      },
      {
        rootMargin: isMobile ? "96px 0px" : "220px 0px",
        threshold: 0.01,
      }
    )
    intersectionObserver.observe(node)

    return () => intersectionObserver.disconnect()
  }, [isMobile])

  const scale = useMemo(() => {
    if (!containerWidth) return 1
    return containerWidth / virtualWidth
  }, [containerWidth, virtualWidth])

  const canRenderIframe = shouldRender && containerWidth > 0
  const { toggleVote, voteCount, isVoting, hasVoted, authStatus } = useVote(code, {
    enabled: shouldRender,
  })

  return (
    <Card className="gap-0 pt-0">
      <div
        ref={wrapperRef}
        className="group relative w-full overflow-hidden"
        style={{ aspectRatio: `${virtualWidth} / ${virtualHeight}` }}
      >
        {canRenderIframe ? (
          <>
            <CardContent
              className="absolute inset-0 p-0 will-change-transform"
              style={{
                width: virtualWidth,
                height: virtualHeight,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                opacity: iframeLoaded ? 1 : 0,
                transition: "opacity 180ms ease",
              }}
            >
              <iframe
                title={`Preset preview ${code}`}
                src={`/preset/${code}?embed=1`}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
                tabIndex={-1}
                className="pointer-events-none h-full w-full border-0"
                onLoad={() => setIframeLoaded(true)}
              />
            </CardContent>
            {!iframeLoaded ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner />
              </div>
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-b from-foreground/20 to-background/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <Link href={`/preset/${code}`} className={buttonVariants({})}>
                Open Preset
              </Link>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        )}
      </div>

      <CardFooter className="justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {description}
          </p>
        </div>
        <Button
          onClick={toggleVote}
          disabled={isVoting}
          aria-pressed={hasVoted}
          variant="outline"
          title={
            authStatus === "authenticated"
              ? "Vote for this preset"
              : "Sign in to vote"
          }
        >
          <Heart
            className={`size-3.5 ${
              hasVoted ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
            }`}
          />
          {voteCount}
        </Button>
      </CardFooter>
    </Card>
  )
}
