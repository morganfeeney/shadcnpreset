"use client"

import { getPresetCode } from "@/app/(create)/lib/preset-code"
import { useDesignSystemSearchParams } from "@/app/(create)/lib/search-params"

export function usePresetCode() {
  const [params] = useDesignSystemSearchParams()
  return getPresetCode(params)
}
