"use client"

import * as React from "react"

const GOOGLE_FONT_QUERY_BY_VALUE: Record<string, string> = {
  inter: "Inter:wght@400;500;600;700",
  "noto-sans": "Noto+Sans:wght@400;500;600;700",
  "nunito-sans": "Nunito+Sans:wght@400;500;600;700",
  figtree: "Figtree:wght@400;500;600;700",
  roboto: "Roboto:wght@400;500;700",
  raleway: "Raleway:wght@400;500;600;700",
  "dm-sans": "DM+Sans:wght@400;500;700",
  "public-sans": "Public+Sans:wght@400;500;600;700",
  outfit: "Outfit:wght@400;500;600;700",
  "jetbrains-mono": "JetBrains+Mono:wght@400;500;700",
  lora: "Lora:wght@400;500;600;700",
  merriweather: "Merriweather:wght@400;700",
  "playfair-display": "Playfair+Display:wght@400;500;600;700",
  "noto-serif": "Noto+Serif:wght@400;500;600;700",
  "roboto-slab": "Roboto+Slab:wght@400;500;600;700",
  oxanium: "Oxanium:wght@400;500;600;700",
  manrope: "Manrope:wght@400;500;600;700",
  "space-grotesk": "Space+Grotesk:wght@400;500;600;700",
  montserrat: "Montserrat:wght@400;500;600;700",
  "ibm-plex-sans": "IBM+Plex+Sans:wght@400;500;600;700",
  "source-sans-3": "Source+Sans+3:wght@400;500;600;700",
  "instrument-sans": "Instrument+Sans:wght@400;500;600;700",
  "eb-garamond": "EB+Garamond:wght@400;500;600;700",
  "instrument-serif": "Instrument+Serif:ital@0;1",
}

function ensurePreconnect(url: string) {
  if (document.head.querySelector(`link[rel="preconnect"][href="${url}"]`)) {
    return
  }
  const link = document.createElement("link")
  link.rel = "preconnect"
  link.href = url
  if (url.includes("gstatic")) {
    link.crossOrigin = "anonymous"
  }
  document.head.appendChild(link)
}

export function PresetFontLoader({ fontValues }: { fontValues: string[] }) {
  React.useEffect(() => {
    ensurePreconnect("https://fonts.googleapis.com")
    ensurePreconnect("https://fonts.gstatic.com")

    const uniqueValues = Array.from(
      new Set(fontValues.filter((value) => value && value !== "inherit"))
    )

    for (const value of uniqueValues) {
      const familyQuery = GOOGLE_FONT_QUERY_BY_VALUE[value]
      if (!familyQuery) {
        continue
      }

      const href = `https://fonts.googleapis.com/css2?family=${familyQuery}&display=swap`
      if (document.head.querySelector(`link[data-preset-font="${value}"]`)) {
        continue
      }

      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = href
      link.setAttribute("data-preset-font", value)
      document.head.appendChild(link)
    }
  }, [fontValues])

  return null
}
