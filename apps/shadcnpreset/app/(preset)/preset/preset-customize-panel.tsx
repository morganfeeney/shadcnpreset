"use client"

import { CustomPresetProperties } from "@/components/custom-presets/custom-preset-properties"
import { Button } from "@/components/ui/button"
import {
  WorkspacePanel,
  WorkspacePanelContent,
  WorkspacePanelHeader,
  WorkspacePanelTitle,
  WorkspacePanelTrigger,
} from "@/components/workspace"

import { usePresetCustomize } from "./preset-customize"

/**
 * Everything to change about the preset on show. Opened again from the bar,
 * so it needs no rail of its own.
 */
export function PresetCustomizePanel() {
  const { value, setValue, isChanged, reset } = usePresetCustomize()
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
      <WorkspacePanelContent>
        <CustomPresetProperties
          code={value.code}
          colours={value.colours}
          sectionHeadings={false}
          onValueChange={setValue}
        />
      </WorkspacePanelContent>
    </WorkspacePanel>
  )
}
