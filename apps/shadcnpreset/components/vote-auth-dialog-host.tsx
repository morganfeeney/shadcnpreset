"use client"

import { useEffect } from "react"

import { VoteAuthDialog } from "@/components/vote-auth-dialog"
import { useAuthStore } from "@/stores/auth-store"

export function VoteAuthDialogHost() {
  const dialogOpen = useAuthStore((state) => state.dialogOpen)
  const isSubmitting = useAuthStore((state) => state.isSubmitting)
  const submittingProvider = useAuthStore((state) => state.submittingProvider)
  const authError = useAuthStore((state) => state.authError)
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession)
  const closeDialog = useAuthStore((state) => state.closeDialog)
  const beginOAuth = useAuthStore((state) => state.beginOAuth)
  const endOAuth = useAuthStore((state) => state.endOAuth)

  useEffect(() => {
    void bootstrapSession()
  }, [bootstrapSession])

  async function handleProviderSignIn(provider: "google" | "github") {
    try {
      await beginOAuth(provider)
    } finally {
      endOAuth()
    }
  }

  return (
    <VoteAuthDialog
      open={dialogOpen}
      isSubmitting={isSubmitting}
      submittingProvider={submittingProvider}
      authError={authError}
      onOpenChange={(open) => {
        if (!open) {
          closeDialog()
        }
      }}
      onGoogleClick={() => {
        void handleProviderSignIn("google")
      }}
      onGitHubClick={() => {
        void handleProviderSignIn("github")
      }}
    />
  )
}
