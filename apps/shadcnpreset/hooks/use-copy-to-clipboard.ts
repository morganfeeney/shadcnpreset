"use client"

import * as React from "react"

import { copyToClipboardWithMeta } from "@/components/copy-button"

export function useCopyToClipboard({
  timeout = 2000,
  onCopy,
}: {
  timeout?: number
  onCopy?: () => void
} = {}) {
  const [isCopied, setIsCopied] = React.useState(false)

  const copyToClipboard = async (value: string) => {
    const hasCopied = await copyToClipboardWithMeta(value)
    if (!hasCopied) {
      return false
    }

    setIsCopied(true)
    onCopy?.()

    if (timeout !== 0) {
      setTimeout(() => {
        setIsCopied(false)
      }, timeout)
    }

    return true
  }

  return { isCopied, copyToClipboard }
}
