"use client"

import { usePresetPageLive } from "@/components/preset-page-live-context"
import { PresetVoteButton } from "@/components/preset-vote-button"
import { ShadcncraftCredit } from "@/components/shadcncraft-examples/credit"
import { Button } from "@/components/ui/button"
import { WorkspaceToolbar } from "@/components/workspace"
import { resolvePresetFromCode } from "@/lib/preset"
import { getPresetPreviewView } from "@/lib/preset-preview"

import { PresetButtons } from "./components"
import { useEffectiveView } from "./effective-view"
import { usePresetCustomize } from "./preset-customize"

/** Over the preview: the view's credit, and what can be done with the preset. */
export function PresetBrowseToolbar() {
  const { livePresetCode } = usePresetPageLive()
  const { isDraft, save, saving } = usePresetCustomize()
  const credit = getPresetPreviewView(useEffectiveView())?.credit
  const resolved = resolvePresetFromCode(livePresetCode)
  if (!resolved) return null

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
        {isDraft ? (
          <>
            <PresetVoteButton size="sm" code={resolved.code} />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={saving}
              onClick={save}
            >
              Install
            </Button>
            <Button type="button" size="sm" disabled={saving} onClick={save}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </>
        ) : (
          <PresetButtons preset={resolved.code} size="sm" />
        )}
      </div>
    </WorkspaceToolbar>
  )
}
