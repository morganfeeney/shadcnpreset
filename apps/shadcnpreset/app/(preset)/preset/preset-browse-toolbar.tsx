"use client"

import { CheckIcon, LinkIcon } from "@phosphor-icons/react"

import { CustomPresetInstallMenu } from "@/components/custom-presets/install-menu"
import { usePresetPageLive } from "@/components/preset-page-live-context"
import { ShadcncraftCredit } from "@/components/shadcncraft-examples/credit"
import { Button } from "@/components/ui/button"
import { WorkspaceToolbar } from "@/components/workspace"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { customPresetRegistryPath } from "@/lib/custom-preset"
import { resolvePresetFromCode } from "@/lib/preset"
import { customPresetPath } from "@/lib/preset-draft"
import { getPresetPreviewView } from "@/lib/preset-preview"

import { PresetButtons } from "./components"
import { useEffectiveView } from "./effective-view"
import { usePresetCustomize } from "./preset-customize"

/**
 * Over the preview: the view's credit, and what can be done with the preset.
 * Changed, it can be put back, installed as it stands, or saved; a saved
 * custom preset installs from its own link and shares its page.
 */
export function PresetBrowseToolbar() {
  const { livePresetCode } = usePresetPageLive()
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
        <PresetActions code={resolved.code} />
      </div>
    </WorkspaceToolbar>
  )
}

function PresetActions({ code }: { code: string }) {
  const { value, saved, isChanged, css, reset, save, saving } =
    usePresetCustomize()
  const origin = typeof window === "undefined" ? "" : window.location.origin

  if (isChanged) {
    return (
      <>
        <Button type="button" size="sm" variant="ghost" onClick={reset}>
          Reset
        </Button>
        <CustomPresetInstallMenu
          code={value.code}
          colours={value.colours}
          css={css}
          variant="outline"
        />
        <Button type="button" size="sm" disabled={saving} onClick={save}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </>
    )
  }

  if (saved) {
    return (
      <>
        <CopyLinkButton url={`${origin}${customPresetPath(saved.id, value.code)}`} />
        <CustomPresetInstallMenu
          code={value.code}
          colours={value.colours}
          css={css}
          registryUrl={`${origin}${customPresetRegistryPath(saved.id)}`}
        />
      </>
    )
  }

  return <PresetButtons preset={code} size="sm" />
}

function CopyLinkButton({ url }: { url: string }) {
  const { isCopied, copyToClipboard } = useCopyToClipboard()
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => void copyToClipboard(url)}
    >
      {isCopied ? (
        <CheckIcon data-icon="inline-start" />
      ) : (
        <LinkIcon data-icon="inline-start" />
      )}
      {isCopied ? "Copied" : "Share"}
    </Button>
  )
}
