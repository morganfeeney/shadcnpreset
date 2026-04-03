import { siteConfig } from "@/lib/config"
import { buildPresetSocialMetaPayload } from "@/lib/build-preset-social-meta"
import { resolvePresetFromCode } from "@/lib/preset"

function setMetaName(name: string, content: string) {
  let el = document.querySelector(`meta[name=${JSON.stringify(name)}]`)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute("name", name)
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

/** Replaces every matching tag so we never leave a stale duplicate (Next may emit several `og:image`s). */
function replaceAllMetaProperty(property: string, content: string) {
  document
    .querySelectorAll(`meta[property=${JSON.stringify(property)}]`)
    .forEach((node) => {
      node.remove()
    })
  const el = document.createElement("meta")
  el.setAttribute("property", property)
  el.setAttribute("content", content)
  document.head.appendChild(el)
}

function setCanonicalLink(href: string) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement("link")
    el.setAttribute("rel", "canonical")
    document.head.appendChild(el)
  }
  el.setAttribute("href", href)
}

/**
 * Keeps `<title>`, canonical, and Open Graph / Twitter tags aligned with the current preset when
 * the URL is updated client-side (`history.replaceState`).
 */
export function syncPresetPageSocialMeta(presetCode: string) {
  if (typeof document === "undefined") {
    return
  }

  const resolved = resolvePresetFromCode(presetCode)
  if (!resolved) {
    return
  }

  const payload = buildPresetSocialMetaPayload(
    resolved,
    window.location.origin,
    siteConfig.name
  )

  document.title = payload.documentTitle

  setMetaName("description", payload.description)
  replaceAllMetaProperty("og:title", payload.ogTitle)
  replaceAllMetaProperty("og:description", payload.description)
  replaceAllMetaProperty("og:url", payload.pageUrl)
  replaceAllMetaProperty("og:image", payload.ogImageUrl)
  replaceAllMetaProperty("og:image:width", "1200")
  replaceAllMetaProperty("og:image:height", "630")
  setMetaName("twitter:card", "summary_large_image")
  setMetaName("twitter:title", payload.ogTitle)
  setMetaName("twitter:description", payload.description)
  setMetaName("twitter:image", payload.ogImageUrl)

  setCanonicalLink(payload.pageUrl)
}
