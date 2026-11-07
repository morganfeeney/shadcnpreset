"use client"

import * as React from "react"
import {
  CheckIcon,
  CopyIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react"

import { usePresetCustomize } from "@/components/preset-customizer/preset-customize"
import { PresetPreviewLayoutPicker } from "@/components/preset-preview/layout-picker"
import { ThemeSwatch } from "@/components/themes/theme-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  WorkspaceBar,
  WorkspaceBarCenter,
  WorkspaceBarEnd,
  WorkspaceBarStart,
  WorkspacePanelTrigger,
} from "@/components/workspace"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { resolvePresetFromCode } from "@/lib/preset"
import { formatPresetCardDescription } from "@/lib/preset-card-description"

/**
 * Along the bottom: the preset on show, its views, and Customize. `start`
 * goes before the name and `controls` after the views, for what a page adds
 * (the preset page's Community toggle and its previous and next).
 */
export function PresetCustomizeBar({
  titleAs = "p",
  start,
  controls,
}: {
  /** The preset page names itself by its code; elsewhere it is a label. */
  titleAs?: "h1" | "p"
  start?: React.ReactNode
  controls?: React.ReactNode
}) {
  const { value, view, setView, generatedPreview } = usePresetCustomize()

  return (
    <WorkspaceBar>
      <WorkspaceBarStart>
        {start}
        <PresetNowShowing titleAs={titleAs} />
      </WorkspaceBarStart>
      <WorkspaceBarCenter>
        <PresetPreviewLayoutPicker
          value={view}
          onValueChange={setView}
          presetCode={value.code}
          adHocView={
            generatedPreview
              ? { page: "generated", label: generatedPreview.title }
              : undefined
          }
        />
        {controls}
      </WorkspaceBarCenter>
      <WorkspaceBarEnd>
        <WorkspacePanelTrigger
          side="end"
          label="Customize"
          aria-label="Customize"
          className="data-[state=expanded]:bg-muted"
        >
          <SlidersHorizontalIcon />
          <span className="hidden sm:inline">Customize</span>
        </WorkspacePanelTrigger>
      </WorkspaceBarEnd>
    </WorkspaceBar>
  )
}

/** The preset on show, as a player names what is playing. */
function PresetNowShowing({ titleAs: Title }: { titleAs: "h1" | "p" }) {
  const { value, saved, isChanged } = usePresetCustomize()
  const { isCopied, copyToClipboard } = useCopyToClipboard()
  const resolved = resolvePresetFromCode(value.code)
  if (!resolved) return null
  const description = formatPresetCardDescription(resolved)

  return (
    <div className="flex min-w-0 items-center gap-3">
      <ThemeSwatch code={value.code} className="size-10" />
      <div className="max-w-80 min-w-0">
        <div className="flex min-w-0 items-center gap-1">
          <Title className="truncate font-mono text-sm font-semibold">
            {value.code}
          </Title>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={isCopied ? "Copied" : "Copy preset code"}
            onClick={() => copyToClipboard(value.code)}
          >
            {isCopied ? <CheckIcon /> : <CopyIcon />}
          </Button>
          {isChanged || saved ? (
            <Badge variant="secondary" className="ml-1">
              {isChanged ? "Draft" : "Custom"}
            </Badge>
          ) : null}
        </div>
        {/* Cut short to fit; the whole of it on hover. */}
        <Tooltip>
          <TooltipTrigger
            render={
              <p className="truncate text-xs text-muted-foreground">
                {description}
              </p>
            }
          />
          <TooltipContent className="max-w-80">{description}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
