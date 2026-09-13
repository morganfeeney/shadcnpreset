import * as React from "react"

export function useIsMobile(mobileBreakpoint = 768) {
  const query = `(max-width: ${mobileBreakpoint - 1}px)`

  return React.useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}
