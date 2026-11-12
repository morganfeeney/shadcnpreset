import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/config"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "AhrefsBot",
        allow: "/",
        crawlDelay: 10,
      },
    ],
    sitemap: [`${siteConfig.url}/sitemap.xml`],
  }
}
