import type { Metadata } from "next"

import { siteConfig } from "@/lib/config"

type SocialImageOptions = {
  url: string
  alt?: string
  width?: number
  height?: number
}

type BuildPageMetadataOptions = {
  title: string
  description: string
  path: string
  socialTitle?: string
  /**
   * `"route"` when the route colocates an `opengraph-image` file. Explicit
   * `images` entries beat Next's file convention, so the fallback card has to
   * be left out entirely or the generated one never reaches the tags.
   */
  image?: SocialImageOptions | "route"
}

export function buildPageMetadata({
  title,
  description,
  path,
  socialTitle = title,
  image,
}: BuildPageMetadataOptions): Metadata {
  if (image === "route") {
    return {
      title,
      description,
      openGraph: {
        title: socialTitle,
        description,
        url: path,
        siteName: siteConfig.name,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: socialTitle,
        description,
      },
    }
  }

  const openGraphImage = image
    ? {
        url: image.url,
        alt: image.alt ?? title,
        ...(image.width ? { width: image.width } : {}),
        ...(image.height ? { height: image.height } : {}),
      }
    : {
        url: siteConfig.ogImage,
        alt: siteConfig.title,
      }

  return {
    title,
    description,
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName: siteConfig.name,
      type: "website",
      images: [openGraphImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [openGraphImage.url],
    },
  }
}

export function getPresetOgImageUrl(code: string) {
  const encoded = encodeURIComponent(code)
  return `${siteConfig.url}/api/presets/${encoded}/opengraph-image?v=${encoded}`
}
