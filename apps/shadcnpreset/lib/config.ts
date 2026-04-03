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
  title: "Discover and compare shadcn presets instantly",
  description:
    "Search by preset code or explore with smart search. Preview real components, discover new presets, and vote for your favourites. Open source and free.",
  links: {
    twitter: "https://twitter.com/morganfeeney",
    github: "https://github.com/morganfeeney/shadcnpreset",
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
