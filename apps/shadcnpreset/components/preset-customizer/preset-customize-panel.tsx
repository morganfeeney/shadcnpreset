"use client"

import * as React from "react"

import { CustomPresetProperties } from "@/components/custom-presets/custom-preset-properties"
import { usePresetCustomize } from "@/components/preset-customizer/preset-customize"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trackEvent } from "@/lib/analytics-events"
import type { CustomizeTab } from "@/lib/preset-draft"
import {
  useWorkspace,
  WorkspacePanel,
  WorkspacePanelContent,
  WorkspacePanelHeader,
  WorkspacePanelTitle,
  WorkspacePanelTrigger,
} from "@/components/workspace"

/**
 * Everything to change about the preset on show. Opened again from the bar,
 * so it needs no rail of its own; fixed open where the workspace doesn't
 * collapse (Ask AI).
 *
 * With `chat`, a second tab to change it by asking instead: the preset page
 * has it, while Ask AI's own conversation sits beside its panel already.
 */
export function PresetCustomizePanel({ chat }: { chat?: React.ReactNode }) {
  const { value, setValue, isChanged, reset, tab, setTab } =
    usePresetCustomize()

  // Opened on the preset page by choice, on a phone too; not as it first
  // shows, which it does by default on a wide screen.
  const { isMobile, open, openMobile } = useWorkspace()
  const shown = isMobile ? openMobile.end : open.end
  const wasShown = React.useRef(shown)
  React.useEffect(() => {
    if (chat && shown && !wasShown.current) {
      trackEvent("customize_open", { how: "button" })
    }
    wasShown.current = shown
  }, [chat, shown])

  const controls = (
    <CustomPresetProperties
      code={value.code}
      colours={value.colours}
      onValueChange={setValue}
    />
  )
  return (
    <WorkspacePanel side="end" label="Customize" collapsible="offcanvas">
      <WorkspacePanelHeader className="px-4">
        <WorkspacePanelTitle>Customize</WorkspacePanelTitle>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          disabled={!isChanged}
          onClick={reset}
        >
          Reset
        </Button>
        <WorkspacePanelTrigger />
      </WorkspacePanelHeader>
      {chat ? (
        <WorkspacePanelContent className="flex flex-col overflow-hidden">
          <Tabs
            value={tab}
            onValueChange={(next) => {
              trackEvent("customize_tab_select", { tab: String(next) })
              setTab(next as CustomizeTab)
            }}
            className="min-h-0 flex-1 gap-0"
          >
            <div className="border-b px-4 py-2.5">
              <TabsList className="w-full">
                <TabsTrigger value="controls">Controls</TabsTrigger>
                <TabsTrigger value="ai">Ask AI</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="controls" className="min-h-0 overflow-y-auto">
              {controls}
            </TabsContent>
            {/* Kept while on Controls, so the conversation is there to go back to. */}
            <TabsContent
              value="ai"
              keepMounted
              className="flex min-h-0 flex-col"
            >
              {chat}
            </TabsContent>
          </Tabs>
        </WorkspacePanelContent>
      ) : (
        <WorkspacePanelContent>{controls}</WorkspacePanelContent>
      )}
    </WorkspacePanel>
  )
}
