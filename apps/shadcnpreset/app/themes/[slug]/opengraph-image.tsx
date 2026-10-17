import { ImageResponse } from "next/og"
import { notFound } from "next/navigation"

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
import {
  getPresetThemePage,
  getPresetThemesFeed,
} from "@/lib/preset-themes-feed"

export const alt = "shadcn theme preview"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

type ImageProps = {
  params: Promise<{ slug: string }>
}

const STRIP_TOKENS = [
  "primary",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
] as const

/** The theme's own corners, scaled up to the strip's size. */
const STRIP_RADIUS: Record<ThemeCorners, number> = {
  square: 0,
  small: 14,
  medium: 18,
  large: 24,
}

export async function generateStaticParams() {
  const themes = await getPresetThemesFeed()
  return themes.map((theme) => ({ slug: theme.slug }))
}

function titleFontSize(titleLength: number): number {
  if (titleLength > 18) return 80
  if (titleLength > 13) return 92
  return 104
}

export default async function Image({ params }: ImageProps) {
  const { slug } = await params
  const page = await getPresetThemePage(slug)
  if (!page) {
    notFound()
  }

  const { theme } = page
  // The card is dark, so the theme shows in its dark mode.
  const vars = theme.registryTheme.cssVars.dark as Record<string, string>
  const hex = (token: string) => oklchCssToHex(vars[token] ?? "")
  const pillRadius = STRIP_RADIUS[theme.fields.corners] * 0.6
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
      {/* Top: logo left, the theme's colors and buttons right */}
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
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: 420,
              height: 72,
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
                  backgroundColor: hex(token),
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "row", gap: 12 }}>
            <div
              style={{
                display: "flex",
                padding: "12px 24px",
                fontSize: 24,
                borderRadius: pillRadius,
                backgroundColor: hex("primary"),
                color: hex("primary-foreground"),
              }}
            >
              Button
            </div>
            <div
              style={{
                display: "flex",
                padding: "12px 24px",
                fontSize: 24,
                borderRadius: pillRadius,
                backgroundColor: hex("secondary"),
                color: hex("secondary-foreground"),
              }}
            >
              Secondary
            </div>
          </div>
        </div>
      </div>
      {/* Bottom-left: eyebrow, theme name and what sets it apart */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignSelf: "flex-start",
          maxWidth: "100%",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 26, fontFamily: GEIST_MONO, color: "#a1a1aa" }}>
          shadcn theme
        </div>
        <div
          style={{
            fontSize: titleFontSize(theme.name.length),
            fontWeight: 500,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {theme.name}
        </div>
        <div style={{ fontSize: 26, fontFamily: GEIST_MONO, color: "#a1a1aa" }}>
          {theme.details.toLowerCase()}
        </div>
      </div>
    </div>,
    { ...size, fonts }
  )
}
