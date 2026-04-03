"use client"

import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"

import {
  clearPendingVote,
  readPendingVoteCode,
} from "@/lib/pending-vote"
import { useAuthStore } from "@/stores/auth-store"

/**
 * After OAuth, the page reloads and Zustand state is reset. The preset code
 * is kept in the URL as `?pendingVote=` (see `callbackURL` in auth) so it
 * round-trips; this effect POSTs /vote once the session is authenticated.
 */
export function PendingVoteApplier() {
  const status = useAuthStore((s) => s.status)
  const queryClient = useQueryClient()
  const ranForSessionRef = useRef(false)

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
