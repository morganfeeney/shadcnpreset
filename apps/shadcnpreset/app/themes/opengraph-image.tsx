import { ImageResponse } from "next/og"

import { logoMarkDataUrl } from "@/components/zippystarter/logo"
import { siteConfig } from "@/lib/config"
import {
  GEIST_MONO,
  INTER,
  loadGeistMono,
  loadInterMedium,
} from "@/lib/og/fonts"
import { oklchCssToHex } from "@/lib/oklch-swatch"
import type { ThemeCorners } from "@/lib/preset-themes"
import { getPresetThemesFeed } from "@/lib/preset-themes-feed"

export const alt = "shadcn themes"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const STRIP_TOKENS = ["primary", "chart-1", "chart-3", "chart-5"] as const

/** Each theme's own corners, scaled up to the strip's size. */
const STRIP_RADIUS: Record<ThemeCorners, number> = {
  square: 0,
  small: 10,
  medium: 14,
  large: 18,
}

export default async function Image() {
  const themes = await getPresetThemesFeed()
  const fonts = await Promise.all([loadInterMedium(), loadGeistMono()])

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "32px 72px 64px 72px",
        background:
          "linear-gradient(155deg, #09090b 0%, #18181b 48%, #0c0c0e 100%)",
        color: "#fafafa",
        fontFamily: INTER,
      }}
    >
      {/* Top: logo left, a few themes' colors right */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingTop: 4,
          }}
        >
          <img
            width={40}
            height={40}
            src={logoMarkDataUrl({ stroke: "#a1a1aa", size: 40 })}
            alt=""
          />
          <div
            style={{
              fontSize: 26,
              letterSpacing: "-0.02em",
              color: "#a1a1aa",
              fontWeight: 500,
            }}
          >
            {siteConfig.name}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            width: 560,
            gap: 14,
          }}
        >
          {themes.slice(0, 6).map((theme) => {
            // The card is dark, so each theme shows in its dark mode.
            const vars = theme.registryTheme.cssVars.dark as Record<
              string,
              string
            >
            return (
              <div
                key={theme.slug}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: 177,
                  height: 52,
                  overflow: "hidden",
                  borderRadius: STRIP_RADIUS[theme.fields.corners],
                  boxShadow: "0 0 0 2px rgba(255 255 255 / 0.12)",
                }}
              >
                {STRIP_TOKENS.map((token, index) => (
                  <div
                    key={token}
                    style={{
                      display: "flex",
                      flexGrow: index === 0 ? 2 : 1,
                      backgroundColor: oklchCssToHex(vars[token] ?? ""),
                    }}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
      {/* Bottom-left: count, title and what you can do */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 26, fontFamily: GEIST_MONO, color: "#a1a1aa" }}>
          {`${themes.length} free color themes`}
        </div>
        <div
          style={{
            fontSize: 112,
            fontWeight: 500,
            letterSpacing: "-0.045em",
            lineHeight: 1,
          }}
        >
          shadcn themes
        </div>
        <div style={{ fontSize: 26, fontFamily: GEIST_MONO, color: "#a1a1aa" }}>
          copy the css · or apply with one command
        </div>
      </div>
    </div>,
    { ...size, fonts }
  )
}
