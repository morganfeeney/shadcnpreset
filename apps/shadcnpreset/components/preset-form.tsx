"use client"

import { useRouter } from "next/navigation"
import * as React from "react"

import { buildSearchHref } from "@/lib/search-route"

export function PresetForm() {
  const router = useRouter()
  const [mode, setMode] = React.useState<"code" | "smart">("code")
  const [query, setQuery] = React.useState("")
  const [isPending, startTransition] = React.useTransition()

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = query.trim()

    if (!normalized) {
      startTransition(() => {
        router.push("/")
      })
      return
    }

    startTransition(() => {
      router.push(buildSearchHref(mode, normalized, 1))
    })
  }

  return (
    <form className="grid gap-2.5" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="preset-query">
        Search presets
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          aria-label="Search mode"
          value={mode}
          onChange={(event) => setMode(event.target.value as "code" | "smart")}
          disabled={isPending}
          className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <option value="code">Preset code</option>
          <option value="smart">Smart search</option>
        </select>
        <input
          id="preset-query"
          autoComplete="off"
          placeholder={
            mode === "code"
              ? "Enter preset code (example: b4aRK5K0fb)"
              : "Describe what you want (e.g. vibrant dashboard, rounded cards)"
          }
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          disabled={isPending}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />
        <button
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  )
}
