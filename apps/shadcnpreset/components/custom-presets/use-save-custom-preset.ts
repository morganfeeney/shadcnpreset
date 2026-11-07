"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { trackEvent } from "@/lib/analytics-events"
import {
  customPresetPath,
  replaceQuery,
  withoutArrival,
  withSaveOnArrival,
  type PresetDraft,
} from "@/lib/preset-draft"
import { PRO_CHECKOUT_URL } from "@/lib/pro"
import { useAuthStore } from "@/stores/auth-store"

export type SavedCustomPreset = {
  id: string
  presetCode: string
  colours: PresetDraft["colours"]
  canEdit: boolean
}

/**
 * Saving a customized preset to someone's account, staying on its page.
 * Their own saved preset is updated; anything else is saved as a new one,
 * within the free cap. Signed out, it asks them to sign in, noting in the
 * address (which already holds the changes) to save on the way back; closing
 * the dialog drops the note.
 */
export function useSaveCustomPreset() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const ensureAuthenticated = useAuthStore((s) => s.ensureAuthenticated)
  const [saving, setSaving] = React.useState(false)

  const save = React.useCallback(
    async (value: PresetDraft, saved: SavedCustomPreset | null) => {
      if (!(await ensureAuthenticated())) {
        replaceQuery(
          withSaveOnArrival(new URLSearchParams(window.location.search))
        )
        const stop = useAuthStore.subscribe((state) => {
          if (state.dialogOpen) return
          stop()
          replaceQuery(
            withoutArrival(new URLSearchParams(window.location.search))
          )
        })
        return
      }

      setSaving(true)
      trackEvent("custom_preset_save", { preset_code: value.code })
      const editing = saved?.canEdit ? saved.id : null
      const response = await fetch(
        editing ? `/api/custom-presets/${editing}` : "/api/custom-presets",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            presetCode: value.code,
            colours: value.colours,
          }),
        }
      ).catch(() => null)
      const body = response
        ? ((await response.json().catch(() => null)) as {
            id?: string
            code?: string
            error?: string
          } | null)
        : null
      setSaving(false)

      const id = editing ?? body?.id
      if (response?.ok && id) {
        const next: SavedCustomPreset = {
          id,
          presetCode: value.code,
          colours: value.colours,
          canEdit: true,
        }
        queryClient.setQueryData(["customPreset", id], next)
        const path = customPresetPath(id, value.code)
        router.replace(path, { scroll: false })
        toast.success("Saved", {
          action: {
            label: "Copy link",
            onClick: () =>
              void navigator.clipboard.writeText(
                new URL(path, window.location.origin).href
              ),
          },
        })
        return
      }

      if (body?.code === "custom_preset_limit") {
        trackEvent("custom_preset_limit_view", {})
        toast.error(
          body.error ??
            "You’ve made as many custom presets as a free account keeps.",
          {
            action: PRO_CHECKOUT_URL
              ? {
                  label: "Upgrade",
                  onClick: () => {
                    trackEvent("pro_checkout_click", {
                      from: "custom_preset_limit",
                    })
                    window.location.assign(PRO_CHECKOUT_URL!)
                  },
                }
              : undefined,
          }
        )
        return
      }
      toast.error("That didn’t save. Try again in a moment.")
    },
    [ensureAuthenticated, queryClient, router]
  )

  return { save, saving }
}
