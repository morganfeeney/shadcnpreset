export const LEARN_PAGE = {
  title: "Learn",
  description:
    "Guides to shadcn presets: what they are, how they work, and how to pick one for your project.",
  href: "/learn",
} as const

export function getLearnArticleHref(slug: string) {
  return `${LEARN_PAGE.href}/${slug}`
}
