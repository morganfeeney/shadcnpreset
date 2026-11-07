"use client"

import * as React from "react"
import {
  CheckIcon,
  CopyIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react"

import { usePresetPageLive } from "@/components/preset-page-live-context"
import { PresetBrowseControls } from "@/components/preset-browse-controls"
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

import { useEffectiveView } from "./effective-view"
import { usePresetCustomize } from "./preset-customize"

/** Along the bottom: the preset on show, its views, and Customize. */
export function PresetBrowseBar() {
  return (
    <WorkspaceBar>
      <WorkspaceBarStart>
        <WorkspacePanelTrigger side="start" label="Community" className="md:hidden" />
        <PresetNowShowing />
      </WorkspaceBarStart>
      <WorkspaceBarCenter>
        <PresetBrowseViewPicker />
        <PresetBrowseCycleControls />
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
function PresetNowShowing() {
  const { livePresetCode } = usePresetPageLive()
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
          <h1 className="truncate font-mono text-sm font-semibold">
            {livePresetCode}
          </h1>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={isCopied ? "Copied" : "Copy preset code"}
            onClick={() => copyToClipboard(livePresetCode)}
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

function PresetBrowseViewPicker() {
  const { livePresetCode, setLiveView, generatedPreview } = usePresetPageLive()
  const view = useEffectiveView()
  if (!resolvePresetFromCode(livePresetCode)) return null

  return (
    <PresetPreviewLayoutPicker
      value={view}
      onValueChange={setLiveView}
      presetCode={livePresetCode}
      adHocView={
        generatedPreview
          ? { page: "generated", label: generatedPreview.title }
          : undefined
      }
    />
  )
}

function PresetBrowseCycleControls() {
  const { livePresetCode, selectLivePreset } = usePresetPageLive()
  const resolved = React.useMemo(
    () => resolvePresetFromCode(livePresetCode),
    [livePresetCode]
  )
  if (!resolved) return null

  return (
    <PresetBrowseControls
      resolved={resolved}
      basePath="/preset"
      cycleOnly
      onSelectPreset={(code) => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
        selectLivePreset(code)
      }}
    />
  )
}
