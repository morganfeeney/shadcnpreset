"use client"

import { create } from "zustand"

import { authClient } from "@/lib/auth-client"

type SessionUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

type AuthStatus = "unknown" | "authenticated" | "anonymous"

type AuthStore = {
  user: SessionUser | null
  status: AuthStatus
  dialogOpen: boolean
  isSubmitting: boolean
  authError: string
  bootstrapSession: () => Promise<void>
  beginOAuth: (provider: "google" | "github") => Promise<void>
  endOAuth: () => void
  ensureAuthenticated: () => Promise<boolean>
  closeDialog: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  status: "unknown",
  dialogOpen: false,
  isSubmitting: false,
  authError: "",

  bootstrapSession: async () => {
    if (get().status !== "unknown") {
      return
    }

    try {
      const result = await authClient.getSession()
      const payload = result.data
      set({
        user:
          payload?.user && "id" in payload.user
            ? (payload.user as SessionUser)
            : null,
        status: payload?.user && "id" in payload.user ? "authenticated" : "anonymous",
      })
    } catch {
      set({ user: null, status: "anonymous" })
    }
  },

  beginOAuth: async (provider) => {
    set({ isSubmitting: true, authError: "" })
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: window.location.href,
      })
    } catch {
      set({
        authError: "Could not sign in right now. Please try again.",
      })
    }
  },

  endOAuth: () => {
    set({ isSubmitting: false })
  },

  ensureAuthenticated: async () => {
    if (get().status === "unknown") {
      await get().bootstrapSession()
    }
    if (get().status === "authenticated") {
      return true
    }
    set({ dialogOpen: true, authError: "" })
    return false
  },

  closeDialog: () => {
    set({
      dialogOpen: false,
      authError: "",
      isSubmitting: false,
    })
  },
}))
