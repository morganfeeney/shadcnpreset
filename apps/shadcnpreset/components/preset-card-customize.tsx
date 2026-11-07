"use client"

import * as React from "react"

type PresetCardCustomizeContextValue = {
  customize: (code: string) => void
  /**
   * A click on the card customizes it, in place of its preview, while a
   * preset is already open beside it to customize.
   */
  customizeOnClick?: boolean
}

const PresetCardCustomizeContext =
  React.createContext<PresetCardCustomizeContextValue | null>(null)

/**
 * A preset card's Customize opens the preset's page with Customize open.
 * Cards inside this customize in place instead, as Ask AI does beside its
 * chat.
 */
function PresetCardCustomizeProvider({
  customize,
  customizeOnClick = false,
  children,
}: PresetCardCustomizeContextValue & { children: React.ReactNode }) {
  const value = React.useMemo(
    () => ({ customize, customizeOnClick }),
    [customize, customizeOnClick]
  )
  return (
    <PresetCardCustomizeContext.Provider value={value}>
      {children}
    </PresetCardCustomizeContext.Provider>
  )
}

/** Null outside a provider: the card links to the preset's page. */
function usePresetCardCustomize() {
  return React.useContext(PresetCardCustomizeContext)
}

export { PresetCardCustomizeProvider, usePresetCardCustomize }
