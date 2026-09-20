import { format, parseISO } from "date-fns"
import { ImageResponse } from "next/og"
import { notFound } from "next/navigation"

import { getLearnArticle, LEARN_ARTICLES } from "@/app/learn/articles"
import { logoMarkDataUrl } from "@/components/zippystarter/logo"
import { siteConfig } from "@/lib/config"
import {
  GEIST_MONO,
  INTER,
  loadGeistMono,
  loadInterMedium,
} from "@/lib/og/fonts"

export const alt = "shadcnpreset learn article"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

type ImageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return LEARN_ARTICLES.map((article) => ({ slug: article.slug }))
}

/**
 * Titles are short by convention, but the ramp keeps a long one on three lines
 * rather than letting it run into the logo row.
 */
function titleFontSize(titleLength: number): number {
  if (titleLength > 60) return 60
  if (titleLength > 44) return 72
  if (titleLength > 30) return 84
  return 96
}

export default async function Image({ params }: ImageProps) {
  const { slug } = await params
  const article = getLearnArticle(slug)

  if (!article) {
    notFound()
  }

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
      {/* Top: logo left, section eyebrow right — mirrors the preset card's header row */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 40,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
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
            flexShrink: 0,
            fontSize: 22,
            fontFamily: GEIST_MONO,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#a1a1aa",
          }}
        >
          Learn
        </div>
      </div>
      {/* Bottom-left: title over date, anchored low like the preset code block */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignSelf: "flex-start",
          minWidth: 0,
          maxWidth: "100%",
          marginBottom: 48,
        }}
      >
        <div
          style={{
            fontSize: titleFontSize(article.title.length),
            fontWeight: 500,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "#fafafa",
          }}
        >
          {article.title}
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 24,
            fontFamily: GEIST_MONO,
            color: "#a1a1aa",
          }}
        >
          {format(parseISO(article.date), "dd MMM yyyy")}
        </div>
      </div>
    </div>,
    { ...size, fonts }
  )
}
