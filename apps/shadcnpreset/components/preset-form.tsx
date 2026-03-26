"use client"

import { useRouter } from "next/navigation"
import * as React from "react"

import { isPresetCode } from "@/lib/preset-codec"

export function PresetForm() {
  const router = useRouter()
  const [value, setValue] = React.useState("")
  const [error, setError] = React.useState("")

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = value.trim()

    if (!isPresetCode(normalized)) {
      setError("Invalid preset format. Expected a* or b* base62 code.")
      return
    }

    setError("")
    router.push(`/preset/${normalized}`)
  }

  return (
    <form className="grid gap-2.5" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="preset-code">
        Preset code
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="preset-code"
          autoComplete="off"
          placeholder="Enter preset code (example: b2xA9)"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />
        <button
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          type="submit"
        >
          Open preset
        </button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  )
}
