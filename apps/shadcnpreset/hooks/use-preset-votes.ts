"use client"

import { useQuery } from "@tanstack/react-query"

type VoteBatchResponse = {
  votesByCode: Record<string, number>
}

export function usePresetVotes(codes: string[]) {
  const key = codes.join(",")

  return useQuery({
    queryKey: ["presetVotes", key],
    enabled: codes.length > 0,
    queryFn: async (): Promise<VoteBatchResponse> => {
      const response = await fetch(
        `/api/presets/votes?codes=${encodeURIComponent(key)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch preset votes")
      }

      return (await response.json()) as VoteBatchResponse
    },
  })
}
