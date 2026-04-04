const siteUrl =
  process.env.VERCEL_ENV === "preview"
    ? `https://${process.env.VERCEL_BRANCH_URL}`
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:4010"

export const siteConfig = {
  name: "shadcnpreset",
  url: siteUrl,
  ogImage: `${siteUrl}/og-card.png`,
  title: "Browse top shadcn presets in seconds",
  description:
    "Search by preset code or explore with smart search. Preview real components, discover new presets, and vote for your favourites. Open source and free.",
  links: {
    twitter: "https://twitter.com/morganfeeney",
    github: "https://github.com/morganfeeney/shadcnpreset",
  },
  analytics: {
    // Google Analytics - if not provided, will not be included
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,

    // HotJar - if not provided, will not be included
    hotjarId: process.env.NEXT_PUBLIC_HOTJAR_ID,
    hotjarVersion: process.env.NEXT_PUBLIC_HOTJAR_VERSION,

    // Vercel Analytics - if false, will not be included
    vercelAnalytics: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  navItems: [
    {
      href: "/docs/installation",
      label: "Docs",
    },
    {
      href: "/docs/components",
      label: "Components",
    },
    {
      href: "/blocks",
      label: "Blocks",
    },
    {
      href: "/charts/area",
      label: "Charts",
    },
    {
      href: "/docs/directory",
      label: "Directory",
    },
    {
      href: "/create",
      label: "Create",
    },
  ],
}

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
}
