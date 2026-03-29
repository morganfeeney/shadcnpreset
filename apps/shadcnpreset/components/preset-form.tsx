"use client"

import { useRouter } from "next/navigation"
import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { buildSearchHref } from "@/lib/search-route"
import { cn } from "@/lib/utils"

export function PresetForm({ className }: { className?: string }) {
  const router = useRouter()
  const [mode, setMode] = React.useState<"code" | "smart">("code")
  const [query, setQuery] = React.useState("")

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = query.trim()

    if (!normalized) {
      router.push("/")
      return
    }

    if (mode === "code") {
      router.push(`/preset/${encodeURIComponent(normalized)}`)
      return
    }

    router.push(buildSearchHref(mode, normalized, 1))
  }

  return (
    <form className={cn("grid gap-2.5", className)} onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="preset-query">
        Search presets
      </label>
      <InputGroup className="h-9">
        <InputGroupAddon align="inline-start">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <InputGroupButton
                  variant="ghost"
                  className="pr-1.5! text-xs"
                  aria-label="Search mode"
                >
                  {mode === "code" ? "Preset code" : "Smart search"}
                  <ChevronDownIcon className="size-3" />
                </InputGroupButton>
              }
            />
            <DropdownMenuContent align="start" sideOffset={8} className="w-40">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setMode("code")}>
                  Preset code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode("smart")}>
                  Smart search
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </InputGroupAddon>
        <InputGroupInput
          id="preset-query"
          autoComplete="off"
          placeholder={
            mode === "code"
              ? "Enter preset code (example: b4aRK5K0fb)"
              : "Describe what you want (e.g. vibrant dashboard, rounded cards)"
          }
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton type="submit" variant="secondary">
            {mode === "code" ? "Open preset" : "Search"}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}
