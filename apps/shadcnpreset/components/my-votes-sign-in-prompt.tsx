"use client"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"

export function MyVotesSignInPrompt() {
  const ensureAuthenticated = useAuthStore((s) => s.ensureAuthenticated)
  return (
    <Button type="button" onClick={() => void ensureAuthenticated()}>
      Sign in
    </Button>
  )
}
