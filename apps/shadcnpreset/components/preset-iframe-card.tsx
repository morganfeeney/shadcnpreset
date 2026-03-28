"use client"

import Link from "next/link"
import { ExternalLink, Heart } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

import { useAuthStore } from "@/stores/auth-store"
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
  const ensureAuth = useAuthStore((state) => state.ensureAuthenticated)
  const authStatus = useAuthStore((state) => state.status)
  const [containerWidth, setContainerWidth] = useState(0)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)

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
    let cancelled = false

    async function loadVoteState() {
      try {
        const response = await fetch(`/api/presets/${code}/vote`, {
          method: "GET",
          cache: "no-store",
        })
        if (!response.ok) return

        const payload = (await response.json()) as {
          votes: number
          hasVoted: boolean
          authenticated: boolean
        }

        if (!cancelled) {
          setVoteCount(payload.votes)
          setHasVoted(payload.hasVoted)
        }
      } catch {
        // Ignore network failures here and keep existing UI state.
      }
    }

    void loadVoteState()
    return () => {
      cancelled = true
    }
  }, [code])

  async function ensureAuthenticated() {
    return ensureAuth()
  }

  async function toggleVote() {
    if (isVoting) {
      return
    }

    setIsVoting(true)
    try {
      const canVote = await ensureAuthenticated()
      if (!canVote) {
        return
      }

      const response = await fetch(`/api/presets/${code}/vote`, {
        method: "POST",
      })
      if (!response.ok) {
        return
      }

      const payload = (await response.json()) as {
        votes: number
        hasVoted: boolean
      }

      setVoteCount(payload.votes)
      setHasVoted(payload.hasVoted)
    } finally {
      setIsVoting(false)
    }
  }

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
    <Card className="pt-0 gap-0">
      <div
        ref={wrapperRef}
        className="group relative w-full overflow-hidden"
        style={{ height: scaledHeight }}
      >
        {shouldLoad ? (
          <>
            <CardContent
              className="p-0 will-change-transform"
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
                tabIndex={-1}
                className="pointer-events-none h-full w-full border-0"
              />
            </CardContent>
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-b from-black/5 to-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="flex flex-col gap-2">
                <Link
                  href={`/preset/${code}`}
                  className={buttonVariants({ size: "sm" })}
                >
                  Open Preset
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Loading preview...
          </div>
        )}
      </div>

      <CardFooter className="flex items-start justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            onClick={toggleVote}
            disabled={isVoting}
            aria-pressed={hasVoted}
            variant="ghost"
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
            <span>{voteCount}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
