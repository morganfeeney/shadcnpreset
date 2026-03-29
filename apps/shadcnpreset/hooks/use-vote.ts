"use client"

import { useEffect, useState } from "react"

import { useAuthStore } from "@/stores/auth-store"

type VoteStateResponse = {
  votes: number
  hasVoted: boolean
}

export default function useVote(code: string) {
  const ensureAuth = useAuthStore((state) => state.ensureAuthenticated)
  const authStatus = useAuthStore((state) => state.status)

  const [voteCount, setVoteCount] = useState(0)
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadVoteState() {
      try {
        const response = await fetch(`/api/presets/${code}/vote`, {
          method: "GET",
          cache: "no-store",
        })
        if (!response.ok) return

        const payload = (await response.json()) as VoteStateResponse
        if (!cancelled) {
          setVoteCount(payload.votes)
          setHasVoted(payload.hasVoted)
        }
      } catch {
        // Keep current UI state on fetch failure.
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

      const payload = (await response.json()) as VoteStateResponse

      setVoteCount(payload.votes)
      setHasVoted(payload.hasVoted)
    } finally {
      setIsVoting(false)
    }
  }

  return {
    toggleVote,
    voteCount,
    isVoting,
    hasVoted,
    authStatus,
  }
}
