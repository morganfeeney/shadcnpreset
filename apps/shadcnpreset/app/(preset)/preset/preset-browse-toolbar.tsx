"use client"

import { usePresetPageLive } from "@/components/preset-page-live-context"
import { ShadcncraftCredit } from "@/components/shadcncraft-examples/credit"
import { Button } from "@/components/ui/button"
import { WorkspaceToolbar } from "@/components/workspace"
import { customPresetRegistryPath } from "@/lib/custom-preset"
import { resolvePresetFromCode } from "@/lib/preset"
import { getPresetPreviewView } from "@/lib/preset-preview"

import { PresetButtons } from "./components"
import { useEffectiveView } from "./effective-view"
import { usePresetCustomize } from "./preset-customize"

/**
 * Over the preview: the view's credit, and what can be done with the preset.
 * The same actions whatever has been changed; Code includes any custom
 * colours, Share copies the page as it stands, and Save keeps the colours.
 */
export function PresetBrowseToolbar() {
  const { livePresetCode } = usePresetPageLive()
  const { css, saved, isChanged, save, saving } = usePresetCustomize()
  const credit = getPresetPreviewView(useEffectiveView())?.credit
  const resolved = resolvePresetFromCode(livePresetCode)
  if (!resolved) return null
  const origin = typeof window === "undefined" ? "" : window.location.origin

  return (
    <WorkspaceToolbar>
      {credit ? (
        <ShadcncraftCredit
          credit={credit}
          presetCode={resolved.code}
          className="hidden truncate sm:block"
        />
      ) : null}
      {/* On a phone the actions scroll sideways rather than widen the page. */}
      <div className="ml-auto flex min-w-0 items-center gap-1.5 overflow-x-auto [&>*]:shrink-0">
        <PresetButtons
          preset={resolved.code}
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
        </PresetButtons>
      </div>
    </WorkspaceToolbar>
  )
}
