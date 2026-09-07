"use client"

import { useQuery } from "@tanstack/react-query"

import type { PresetSidebarItem } from "@/lib/preset-sidebar-item"
import { useAuthStore } from "@/stores/auth-store"

type MyPresetsResponse = {
  authenticated: boolean
  items: PresetSidebarItem[]
}

export function useMyPresets() {
  const authStatus = useAuthStore((state) => state.status)

  return useQuery({
    queryKey: ["myPresets", authStatus],
    enabled: authStatus === "authenticated",
    staleTime: 30_000,
    queryFn: async (): Promise<MyPresetsResponse> => {
      const response = await fetch("/api/presets/mine", {
        method: "GET",
        cache: "no-store",
      })
      if (!response.ok) {
        throw new Error("Failed to load your presets")
      }
      return (await response.json()) as MyPresetsResponse
    },
  })
}
