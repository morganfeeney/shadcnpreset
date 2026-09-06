"use client"

import { useRouter } from "next/navigation"
import {
  CaretLeftIcon,
  CaretRightIcon,
  CodeIcon,
  ShuffleIcon,
} from "@phosphor-icons/react"
import { useMemo, useState, type MouseEvent, type ReactNode } from "react"

import { GetCodeDialog } from "@/components/get-code-dialog"
import { PresetVoteButton } from "@/components/preset-vote-button"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"
import { getRelatedPresets } from "@/app/(preset)/pdp/[slug]/related-presets"
import type { ResolvedPreset } from "@/lib/preset"
import { generateRandomCompatiblePreset } from "@/lib/random-preset"
import { cn } from "@/lib/utils"

export type PresetBrowseBasePath = "/preset" | "/pdp"

type PresetBrowseControlsProps = {
  resolved: ResolvedPreset
  basePath: PresetBrowseBasePath
  /** Query string to keep across prev/random/next, e.g. `?view=dashboard`. */
  search?: string
  className?: string
  children?: ReactNode
  /** Icon cycle controls only — used on the preset page tab row. */
  cycleOnly?: boolean
}

export function PresetBrowseControls({
  resolved,
  basePath,
  search = "",
  className,
  children,
  cycleOnly = false,
}: PresetBrowseControlsProps) {
  const router = useRouter()
  const [getCodeOpen, setGetCodeOpen] = useState(false)
  const navCodes = useMemo(() => {
    const related = getRelatedPresets(resolved, 12).filter(
      (code) => code !== resolved.code
    )
    return [resolved.code, ...related]
  }, [resolved])

  const canCyclePresets = navCodes.length > 1
  const prevCode = canCyclePresets ? navCodes[navCodes.length - 1]! : null
  const nextCode = canCyclePresets ? navCodes[1]! : null

  function navigateToPreset(code: string) {
    // Avoid browser restoring focus to sticky footer controls after nav,
    // which can scroll the new page down to this section.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    const suffix = search.startsWith("?") ? search : search ? `?${search}` : ""
    // Keep current scroll position across preset-to-preset navigation.
    // This avoids browser-specific focus/anchor jumps (notably Safari).
    router.push(`${basePath}/${code}${suffix}`, { scroll: false })
  }

  function preventPointerFocus(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
  }

  function onRandomPreset() {
    navigateToPreset(generateRandomCompatiblePreset())
  }

  function onPreviousPreset() {
    if (!prevCode) return
    navigateToPreset(prevCode)
  }

  function onNextPreset() {
    if (!nextCode) return
    navigateToPreset(nextCode)
  }

  const cycleButtons = (
    <InputGroup className="w-auto">
      <InputGroupAddon align="inline-start" className="gap-0 px-0">
        <InputGroupButton
          size="icon-sm"
          onMouseDown={preventPointerFocus}
          onClick={onPreviousPreset}
          disabled={!canCyclePresets}
          aria-label="Previous related preset"
        >
          <CaretLeftIcon className="size-4" />
        </InputGroupButton>
        <InputGroupButton
          size="icon-sm"
          onMouseDown={preventPointerFocus}
          onClick={onRandomPreset}
          aria-label="Random preset"
        >
          <ShuffleIcon className="size-4" />
        </InputGroupButton>
        <InputGroupButton
          size="icon-sm"
          onMouseDown={preventPointerFocus}
          onClick={onNextPreset}
          disabled={!canCyclePresets}
          aria-label="Next related preset"
        >
          <CaretRightIcon className="size-4" />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )

  if (cycleOnly) {
    return <div className={cn("flex items-center", className)}>{cycleButtons}</div>
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-2 bg-background p-1.5",
        "rounded-xl border bg-background/95 shadow-lg backdrop-blur-sm",
        className
      )}
    >
      {children}
      {cycleButtons}
      <PresetVoteButton code={resolved.code} />
      <Button
        variant="outline"
        onMouseDown={preventPointerFocus}
        onClick={() => setGetCodeOpen(true)}
      >
        <CodeIcon className="size-4" />
        Code
      </Button>
      <GetCodeDialog
        open={getCodeOpen}
        onOpenChange={setGetCodeOpen}
        presetCode={resolved.code}
      />
    </div>
  )
}
