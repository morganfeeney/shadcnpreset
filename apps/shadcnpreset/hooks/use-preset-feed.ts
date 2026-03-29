"use client"

import { useQuery } from "@tanstack/react-query"

import type { PresetPageItem } from "@/lib/preset-catalog"

type PresetFeedResponse = {
  items: PresetPageItem[]
  safePage: number
  totalPages: number
}

export function usePresetFeed(
  page: number,
  size: number,
  initialData?: PresetFeedResponse
) {
  return useQuery({
    queryKey: ["presetFeed", page, size],
    queryFn: async (): Promise<PresetFeedResponse> => {
      const response = await fetch(`/api/presets/feed?page=${page}&size=${size}`, {
        method: "GET",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch preset feed")
      }

      return (await response.json()) as PresetFeedResponse
    },
    initialData,
  })
}
