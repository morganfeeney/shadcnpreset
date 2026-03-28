"use client"

import Link from "next/link"
import { ExternalLink, Heart } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

import { VoteAuthDialog } from "@/components/vote-auth-dialog"

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
  const [shouldLoad, setShouldLoad] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const [hasVoted, setHasVoted] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false)
  const authResolverRef = useRef<((name: string | null) => void) | null>(null)

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
          setAuthenticated(payload.authenticated)
        }
      } catch {
        if (!cancelled) {
          setAuthenticated(false)
        }
      }
    }

    void loadVoteState()
    return () => {
      cancelled = true
    }
  }, [code])

  function resolveAuthDialog(name: string | null) {
    setAuthDialogOpen(false)
    const resolver = authResolverRef.current
    authResolverRef.current = null
    resolver?.(name)
  }

  function requestDisplayName() {
    return new Promise<string | null>((resolve) => {
      authResolverRef.current = resolve
      setAuthDialogOpen(true)
    })
  }

  async function ensureAuthenticated() {
    if (authenticated) {
      return true
    }

    const name = await requestDisplayName()
    if (!name?.trim()) {
      return false
    }

    setIsAuthSubmitting(true)
    const sessionResponse = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    setIsAuthSubmitting(false)

    if (!sessionResponse.ok) {
      return false
    }

    setAuthenticated(true)
    return true
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
        authenticated: boolean
      }

      setVoteCount(payload.votes)
      setHasVoted(payload.hasVoted)
      setAuthenticated(payload.authenticated)
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
    <Card className="overflow-hidden rounded-xl border bg-card/60 pt-0">
      <div
        ref={wrapperRef}
        className="relative w-full overflow-hidden"
        style={{ height: scaledHeight }}
      >
        {shouldLoad ? (
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
          <button
            type="button"
            onClick={toggleVote}
            disabled={isVoting}
            aria-pressed={hasVoted}
            className="inline-flex h-7 items-center gap-1 rounded-md border bg-background px-2 text-xs font-medium hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
            title={authenticated ? "Vote for this preset" : "Sign in to vote"}
          >
            <Heart
              className={`size-3.5 ${
                hasVoted
                  ? "fill-rose-500 text-rose-500"
                  : "text-muted-foreground"
              }`}
            />
            <span>{voteCount}</span>
          </button>
          <Link
            href={`/preset/${code}`}
            className="inline-flex h-7 items-center gap-1 rounded-md border bg-background px-2 text-xs font-medium hover:bg-muted/50"
          >
            Open
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </CardFooter>
      <VoteAuthDialog
        open={authDialogOpen}
        isSubmitting={isAuthSubmitting}
        onOpenChange={(open) => {
          if (!open) {
            resolveAuthDialog(null)
          } else {
            setAuthDialogOpen(true)
          }
        }}
        onSubmit={(name) => resolveAuthDialog(name)}
      />
    </Card>
  )
}
