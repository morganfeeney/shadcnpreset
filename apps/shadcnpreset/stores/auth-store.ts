"use client"

import { create } from "zustand"

type SessionUser = {
  id: string
  name: string
}

type AuthStatus = "unknown" | "authenticated" | "anonymous"

type AuthStore = {
  user: SessionUser | null
  status: AuthStatus
  dialogOpen: boolean
  isSubmitting: boolean
  authError: string
  resolver: ((ok: boolean) => void) | null
  bootstrapSession: () => Promise<void>
  loginWithName: (name: string) => Promise<boolean>
  logout: () => Promise<void>
  ensureAuthenticated: () => Promise<boolean>
  closeDialog: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  status: "unknown",
  dialogOpen: false,
  isSubmitting: false,
  authError: "",
  resolver: null,

  bootstrapSession: async () => {
    if (get().status !== "unknown") {
      return
    }

    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        cache: "no-store",
      })
      if (!response.ok) {
        set({ user: null, status: "anonymous" })
        return
      }

      const payload = (await response.json()) as { user: SessionUser | null }
      set({
        user: payload.user ?? null,
        status: payload.user ? "authenticated" : "anonymous",
      })
    } catch {
      set({ user: null, status: "anonymous" })
    }
  },

  loginWithName: async (name: string) => {
    set({ isSubmitting: true, authError: "" })
    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        set({
          isSubmitting: false,
          authError: "Could not sign in right now. Please try again.",
        })
        return false
      }

      const payload = (await response.json()) as { user: SessionUser }
      const resolver = get().resolver
      set({
        user: payload.user,
        status: "authenticated",
        dialogOpen: false,
        resolver: null,
        isSubmitting: false,
        authError: "",
      })
      resolver?.(true)
      return true
    } catch {
      set({
        isSubmitting: false,
        authError: "Could not sign in right now. Please try again.",
      })
      return false
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" })
    } finally {
      set({
        user: null,
        status: "anonymous",
      })
    }
  },

  ensureAuthenticated: async () => {
    if (get().status === "unknown") {
      await get().bootstrapSession()
    }
    if (get().status === "authenticated") {
      return true
    }

    return new Promise<boolean>((resolve) => {
      set({
        dialogOpen: true,
        authError: "",
        resolver: resolve,
      })
    })
  },

  closeDialog: () => {
    const resolver = get().resolver
    set({
      dialogOpen: false,
      resolver: null,
      authError: "",
      isSubmitting: false,
    })
    resolver?.(false)
  },
}))
