"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"

import {
  clearPendingVote,
  readPendingVoteCode,
} from "@/lib/pending-vote"
import { useAuthStore } from "@/stores/auth-store"

/**
 * After OAuth, the page reloads and client state resets. The preset code is
 * stored in sessionStorage until the session is authenticated; this effect POSTs
 * /vote once. Anonymous in-app navigations clear the stored intent so it only
 * applies around completing sign-in.
 */
export function PendingVoteApplier() {
  const pathname = usePathname()
  const status = useAuthStore((s) => s.status)
  const queryClient = useQueryClient()
  const ranForSessionRef = useRef(false)
  const prevPathnameRef = useRef<string | null>(null)

  useEffect(() => {
    if (
      prevPathnameRef.current !== null &&
      prevPathnameRef.current !== pathname &&
      status === "anonymous"
    ) {
      clearPendingVote()
    }
    prevPathnameRef.current = pathname
  }, [pathname, status])

  useEffect(() => {
    if (status !== "authenticated") {
      ranForSessionRef.current = false
      return
    }
    if (ranForSessionRef.current) {
      return
    }

    const code = readPendingVoteCode()
    if (!code) {
      return
    }

    ranForSessionRef.current = true
    clearPendingVote()

    void (async () => {
      try {
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
        queryClient.setQueryData(["presetVote", code], {
          votes: payload.votes,
          hasVoted: payload.hasVoted,
        })
        await queryClient.invalidateQueries({ queryKey: ["presetFeed"] })
      } catch {
        // ignore; user can tap vote again
      }
    })()
  }, [status, queryClient])

  return null
}
