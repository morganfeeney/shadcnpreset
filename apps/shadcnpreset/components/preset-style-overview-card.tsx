"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

import useVote from "@/hooks/use-vote"
import { useIsMobile } from "@/hooks/use-mobile"
import { PresetPreviewDialog } from "@/components/preset-preview-dialog"
import { PresetCard1StyleOverview } from "@/app/poc/preset-swatch/components/preset-card-1-style-overview"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  trackAiAssistantResultClick,
  trackPresetEditClick,
  trackPresetPreview,
  trackPresetVoteClick,
} from "@/lib/analytics-events"

type PresetStyleOverviewCardProps = {
  code: string
  title: string
  description: string
  virtualWidth?: number
  virtualHeight?: number
}

export function PresetStyleOverviewCard({
  code,
  title,
  description,
  virtualWidth = 700,
  virtualHeight = 575,
}: PresetStyleOverviewCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [shouldRender, setShouldRender] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const isMobile = useIsMobile()
  const pathname = usePathname()

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

    let intersectionObserver: IntersectionObserver | null = null

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting)

        if (!isMobile && isVisible) {
          setShouldRender(true)
          intersectionObserver?.disconnect()
          return
        }

        setShouldRender(isVisible)
      },
      {
        rootMargin: isMobile ? "96px 0px" : "220px 0px",
        threshold: 0.01,
      }
    )
    intersectionObserver.observe(node)

    return () => intersectionObserver?.disconnect()
  }, [isMobile])

  const scale = useMemo(() => {
    if (!containerWidth) return 1
    return containerWidth / virtualWidth
  }, [containerWidth, virtualWidth])

  const canRenderPreview = shouldRender && containerWidth > 0
  const { toggleVote, voteCount, isVoting, hasVoted, authStatus } = useVote(
    code,
    {
      enabled: shouldRender,
    }
  )

  const isAssistantSurface = pathname.startsWith("/assistant")

  function handlePreview() {
    trackPresetPreview({ pagePath: pathname, presetCode: code })
    if (isAssistantSurface) {
      trackAiAssistantResultClick({
        pagePath: pathname,
        resultType: "action",
        targetId: `preview:${code}`,
      })
    }
    setPreviewOpen(true)
  }

  function handleEditNavigate() {
    trackPresetEditClick({ pagePath: pathname, presetCode: code })
    if (isAssistantSurface) {
      trackAiAssistantResultClick({
        pagePath: pathname,
        resultType: "preset",
        targetId: code,
      })
    }
  }

  function handleVoteClick() {
    trackPresetVoteClick({ pagePath: pathname, presetCode: code })
    if (isAssistantSurface) {
      trackAiAssistantResultClick({
        pagePath: pathname,
        resultType: "action",
        targetId: `vote:${code}`,
      })
    }
    void toggleVote()
  }

  return (
    <Card className="gap-0 pt-0">
      <div
        ref={wrapperRef}
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: `${virtualWidth} / ${virtualHeight}` }}
      >
        {canRenderPreview ? (
          <>
            <CardContent
              className="absolute inset-0 p-0 will-change-transform"
              style={{
                width: virtualWidth,
                height: virtualHeight,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <PresetCard1StyleOverview
                initialCode={code}
                className="h-full w-full overflow-auto"
              />
            </CardContent>
            <div className="absolute inset-0">
              <div
                aria-hidden
                className="absolute inset-0 bg-linear-to-b from-foreground/20 to-background/20 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100 [@media(hover:none)]:hidden"
              />
              <div className="invisible absolute inset-0 z-10 grid place-content-center gap-2 group-hover/card:visible [@media(hover:none)]:hidden">
                <Button type="button" onClick={handlePreview}>
                  Preview
                </Button>
                <Link
                  href={`/preset/${code}`}
                  className={cn(buttonVariants({ variant: "outline" }))}
                  onClick={handleEditNavigate}
                >
                  Edit
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        )}
      </div>

      <PresetPreviewDialog
        code={code}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={title}
        description={description}
      />

      <CardFooter className="flex flex-col gap-3">
        <div className="flex w-full justify-between gap-2">
          <div>
            <p className="truncate font-mono text-sm font-medium">{title}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {description}
            </p>
          </div>
          <Button
            onClick={handleVoteClick}
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
                hasVoted
                  ? "fill-rose-500 text-rose-500"
                  : "text-muted-foreground"
              }`}
            />
            {voteCount}
          </Button>
        </div>
        <div className="flex w-full flex-wrap gap-2 [@media(hover:hover)]:hidden">
          <Button type="button" onClick={handlePreview}>
            Preview
          </Button>
          <Link
            href={`/preset/${code}`}
            className={cn(buttonVariants({ variant: "outline" }))}
            onClick={handleEditNavigate}
          >
            Edit
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
