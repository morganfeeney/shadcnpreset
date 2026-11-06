"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { trackEvent } from "@/lib/analytics-events"
import type { CustomColours } from "@/lib/custom-colours"
import { customPresetPath } from "@/lib/custom-preset"
import {
  replaceQuery,
  withoutArrival,
  withSaveOnArrival,
} from "@/lib/preset-draft"
import { PRO_CHECKOUT_URL } from "@/lib/pro"
import { useAuthStore } from "@/stores/auth-store"

/**
 * Saving a preset someone has customized but not yet kept. Signed in, it
 * saves and moves to the saved preset's own page. Signed out, it asks them to
 * sign in, noting in the address (which already holds the draft) to save it,
 * so signing in comes back and saves it then; closing the dialog drops the
 * note. Past the free cap it offers Pro
 * and leaves the draft as it is.
 */
export function useSaveCustomPreset() {
  const router = useRouter()
  const ensureAuthenticated = useAuthStore((s) => s.ensureAuthenticated)
  const [saving, setSaving] = React.useState(false)

  const save = React.useCallback(
    async ({ code, colours }: { code: string; colours: CustomColours }) => {
      if (!(await ensureAuthenticated())) {
        replaceQuery(
          withSaveOnArrival(new URLSearchParams(window.location.search))
        )
        // Signing in leaves the page with the note in place; closing the
        // dialog instead means there is nothing to save on the way back.
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
      trackEvent("custom_preset_save", { preset_code: code })
      const response = await fetch("/api/custom-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetCode: code, colours }),
      }).catch(() => null)
      const body = response
        ? ((await response.json().catch(() => null)) as {
            id?: string
            code?: string
            error?: string
          } | null)
        : null
      if (response?.ok && body?.id) {
        router.push(customPresetPath(body.id))
        return
      }
      setSaving(false)
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
    [ensureAuthenticated, router]
  )

  return { save, saving }
}
