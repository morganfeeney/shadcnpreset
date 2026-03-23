"use client"

import * as React from "react"
import { useTheme } from "next-themes"

type ThemeMode = "light" | "dark" | "system"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const mode = (theme ?? "system") as ThemeMode

  return (
    <div className="theme-switcher" role="group" aria-label="Theme mode">
      <button
        className={mode === "light" ? "is-active" : ""}
        onClick={() => setTheme("light")}
        type="button"
      >
        Light
      </button>
      <button
        className={mode === "dark" ? "is-active" : ""}
        onClick={() => setTheme("dark")}
        type="button"
      >
        Dark
      </button>
      <button
        className={mode === "system" ? "is-active" : ""}
        onClick={() => setTheme("system")}
        type="button"
      >
        System
      </button>
    </div>
  )
}
