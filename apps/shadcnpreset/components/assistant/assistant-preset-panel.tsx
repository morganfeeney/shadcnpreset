"use client"

import { CaretLeftIcon, XIcon } from "@phosphor-icons/react"

import { CustomPresetBodySkeleton } from "@/components/custom-presets/custom-preset-skeleton"
import { PresetCustomizeProvider } from "@/components/preset-customizer/preset-customize"
import { PresetCustomizeBar } from "@/components/preset-customizer/preset-customize-bar"
import { PresetCustomizeCreditImpression } from "@/components/preset-customizer/preset-customize-credit"
import { PresetCustomizePanel } from "@/components/preset-customizer/preset-customize-panel"
import { PresetCustomizePreview } from "@/components/preset-customizer/preset-customize-preview"
import { PresetCustomizeToolbar } from "@/components/preset-customizer/preset-customize-toolbar"
import { Button } from "@/components/ui/button"
import {
  WorkspaceBody,
  WorkspaceMain,
  WorkspaceProvider,
} from "@/components/workspace"

/**
 * A preset beside the conversation, to customize: the same customizer as
 * the preset page, without its Community list or its previous and next.
 * Customize stays open beside the preview, since nothing here collapses; on
 * a phone it opens from the bar. A way back to the chat on a phone, a close
 * button on a wide screen.
 */
export function AssistantPresetPanel({
  code,
  query,
  goTo,
  waiting = false,
  onClose,
}: {
  code: string
  query: URLSearchParams
  goTo: (code: string, query: URLSearchParams) => void
  /** Still sliding in: the skeleton holds the preview's place until it stops. */
  waiting?: boolean
  onClose: () => void
}) {
  const close = (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="xl:hidden"
        onClick={onClose}
      >
        <CaretLeftIcon data-icon="inline-start" />
        Chat
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Close"
        className="hidden xl:inline-flex"
        onClick={onClose}
      >
        <XIcon />
      </Button>
    </>
  )

  return (
    <PresetCustomizeProvider code={code} query={query} goTo={goTo}>
      <PresetCustomizeCreditImpression />
      <WorkspaceProvider collapsible={false} className="h-full">
        <WorkspaceBody>
          <WorkspaceMain>
            <PresetCustomizeToolbar>{close}</PresetCustomizeToolbar>
            {waiting ? <CustomPresetBodySkeleton /> : <PresetCustomizePreview />}
          </WorkspaceMain>
          {waiting ? null : <PresetCustomizePanel />}
        </WorkspaceBody>
        <PresetCustomizeBar />
      </WorkspaceProvider>
    </PresetCustomizeProvider>
  )
}
