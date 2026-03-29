"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuthStore } from "@/stores/auth-store"

type VoteStateResponse = {
  votes: number
  hasVoted: boolean
}

type VoteBatchResponse = {
  votesByCode: Record<string, number>
}

type PresetFeedItem = {
  code: string
}

type PresetFeedResponse = {
  items: PresetFeedItem[]
}

type UseVoteOptions = {
  enabled?: boolean
}

export default function useVote(code: string, options: UseVoteOptions = {}) {
  const enabled = options.enabled ?? true
  const ensureAuth = useAuthStore((state) => state.ensureAuthenticated)
  const authStatus = useAuthStore((state) => state.status)
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ["presetVote", code],
    enabled,
    queryFn: async (): Promise<VoteStateResponse> => {
      const response = await fetch(`/api/presets/${code}/vote`, {
        method: "GET",
        cache: "no-store",
      })
      if (!response.ok) {
        throw new Error("Failed to fetch vote state")
      }
      return (await response.json()) as VoteStateResponse
    },
  })

  const voteMutation = useMutation({
    mutationFn: async (): Promise<VoteStateResponse> => {
      const response = await fetch(`/api/presets/${code}/vote`, {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Failed to toggle vote")
      }
      return (await response.json()) as VoteStateResponse
    },
    onSuccess: (payload) => {
      queryClient.setQueryData<VoteStateResponse>(["presetVote", code], payload)
      queryClient.setQueriesData(
        { queryKey: ["presetVotes"] },
        (previous: VoteBatchResponse | undefined) => {
          if (!previous?.votesByCode) {
            return previous
          }
          return {
            ...previous,
            votesByCode: {
              ...previous.votesByCode,
              [code]: payload.votes,
            },
          }
        }
      )

      const feedQueries = queryClient.getQueriesData<PresetFeedResponse>({
        queryKey: ["presetFeed"],
      })
      const appearsInCachedFeed = feedQueries.some(([, feed]) =>
        (feed?.items ?? []).some((item) => item.code === code)
      )

      void queryClient.invalidateQueries({ queryKey: ["presetVotes"] })
      if (!appearsInCachedFeed) {
        void queryClient.invalidateQueries({ queryKey: ["presetFeed"] })
      }
      void queryClient.invalidateQueries({ queryKey: ["presetVote", code] })
    },
  })

  async function ensureAuthenticated() {
    return ensureAuth()
  }

  async function toggleVote() {
    if (voteMutation.isPending) {
      return
    }

    const canVote = await ensureAuthenticated()
    if (!canVote) {
      return
    }

    await voteMutation.mutateAsync()
  }

  const voteCount = data?.votes ?? 0
  const hasVoted = data?.hasVoted ?? false

  return {
    toggleVote,
    voteCount,
    isVoting: voteMutation.isPending,
    hasVoted,
    authStatus,
  }
}
