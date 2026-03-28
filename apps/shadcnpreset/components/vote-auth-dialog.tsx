"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type VoteAuthDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (name: string) => void
  isSubmitting?: boolean
  authError?: string
}

export function VoteAuthDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  authError = "",
}: VoteAuthDialogProps) {
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Please enter a display name.")
      return
    }
    onSubmit(trimmedName)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>Sign in to vote</DialogTitle>
          <DialogDescription>
            Use a display name so your votes can count toward the public leaderboard.
          </DialogDescription>
        </DialogHeader>
        <Card className="border-border/80 bg-background/60 py-3">
          <CardHeader className="px-3">
            <CardTitle className="text-sm">Login to your account</CardTitle>
            <CardDescription>Enter your display name to continue.</CardDescription>
          </CardHeader>
          <CardContent className="px-3">
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="vote-display-name">Display name</FieldLabel>
                  <Input
                    id="vote-display-name"
                    placeholder="e.g. Jack"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value)
                      if (error) {
                        setError("")
                      }
                    }}
                    disabled={isSubmitting}
                    autoFocus
                  />
                  {error ? (
                    <FieldDescription className="text-destructive">
                      {error}
                    </FieldDescription>
                  ) : null}
                  {authError ? (
                    <FieldDescription className="text-destructive">
                      {authError}
                    </FieldDescription>
                  ) : null}
                </Field>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Continue"}
                  </Button>
                </DialogFooter>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
