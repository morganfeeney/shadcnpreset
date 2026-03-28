"use client"

import { useEffect } from "react"

import { VoteAuthDialog } from "@/components/vote-auth-dialog"
import { useAuthStore } from "@/stores/auth-store"

export function VoteAuthDialogHost() {
  const dialogOpen = useAuthStore((state) => state.dialogOpen)
  const isSubmitting = useAuthStore((state) => state.isSubmitting)
  const authError = useAuthStore((state) => state.authError)
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession)
  const closeDialog = useAuthStore((state) => state.closeDialog)
  const loginWithName = useAuthStore((state) => state.loginWithName)

  useEffect(() => {
    void bootstrapSession()
  }, [bootstrapSession])

  return (
    <VoteAuthDialog
      open={dialogOpen}
      isSubmitting={isSubmitting}
      authError={authError}
      onOpenChange={(open) => {
        if (!open) {
          closeDialog()
        }
      }}
      onSubmit={(name) => {
        void loginWithName(name)
      }}
    />
  )
}
