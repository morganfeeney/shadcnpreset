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
    <form className="input-row" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="preset-code">
        Preset code
      </label>
      <input
        id="preset-code"
        autoComplete="off"
        placeholder="Enter preset code (example: b2xA9)"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button className="btn btn-primary" type="submit">
        Open preset route
      </button>
      {error ? <p className="error-text">{error}</p> : null}
    </form>
  )
}
