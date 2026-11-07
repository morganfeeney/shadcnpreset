"use client"

import * as React from "react"

import { PresetActionButtons } from "@/components/preset-action-buttons"
import { usePresetCustomize } from "@/components/preset-customizer/preset-customize"
import { ShadcncraftCredit } from "@/components/shadcncraft-examples/credit"
import { Button } from "@/components/ui/button"
import { WorkspaceToolbar } from "@/components/workspace"
import { customPresetRegistryPath } from "@/lib/custom-preset"
import { getPresetPreviewView } from "@/lib/preset-preview"

/**
 * Over the preview: the view's credit, and what can be done with the preset.
 * The same actions whatever has been changed; Code includes any custom
 * colours, Share copies the address as it stands, and Save keeps the
 * colours. `children` go last, for the page's own (Ask AI's close).
 */
export function PresetCustomizeToolbar({
  children,
}: {
  children?: React.ReactNode
}) {
  const { value, view, css, saved, isChanged, save, saving } =
    usePresetCustomize()
  const credit = getPresetPreviewView(view)?.credit
  const origin = typeof window === "undefined" ? "" : window.location.origin

  return (
    <WorkspaceToolbar>
      {credit ? (
        <ShadcncraftCredit
          credit={credit}
          presetCode={value.code}
          className="hidden truncate sm:block"
        />
      ) : null}
      {/* On a phone the actions scroll sideways rather than widen the page. */}
      <div className="ml-auto flex min-w-0 items-center gap-1.5 overflow-x-auto [&>*]:shrink-0">
        <PresetActionButtons
          preset={value.code}
          size="sm"
          customColours={
            css
              ? {
                  css,
                  // The saved link has the saved colours, not unsaved ones.
                  registryUrl:
                    saved && !isChanged
                      ? `${origin}${customPresetRegistryPath(saved.id)}`
                      : undefined,
                }
              : undefined
          }
        >
          <Button
            type="button"
            size="sm"
            disabled={!isChanged || saving}
            title={isChanged ? undefined : "Change a colour to save it"}
            onClick={save}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </PresetActionButtons>
      </div>
      {children}
    </WorkspaceToolbar>
  )
}
