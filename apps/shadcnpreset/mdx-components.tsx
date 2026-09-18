import type { MDXComponents } from "mdx/types"
import Link from "next/link"

import { AffiliateLink } from "@/components/affiliate-link"
import { StyleShowcase } from "@/components/learn/style-showcase"
import { isAffiliateHref } from "@/lib/affiliate-link"

/**
 * Map used by `@next/mdx` and by Content Collections `<MDXContent />` on the server.
 * Behaviour only: all styling lives in app/markdown.css, applied by wrapping the
 * rendered content in `.markdown`.
 */
export const mdxDocumentationComponents = {
  a: ({ href, children, ...props }) => {
    if (href?.startsWith("/") || href?.startsWith("#")) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      )
    }
    // Affiliate links are marked sponsored and report their clicks.
    if (isAffiliateHref(href)) {
      return (
        <AffiliateLink href={href as string} {...props}>
          {children}
        </AffiliateLink>
      )
    }
    return (
      <a href={href} target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
    )
  },
  // Scroll container for wide tables; styled in app/markdown.css.
  table: (props) => (
    <div className="markdown-table">
      <table {...props} />
    </div>
  ),
  // Interactive embeds for learn articles. Live cn-ui controls per style.
  StyleShowcase,
} satisfies MDXComponents

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxDocumentationComponents,
    ...components,
  }
}
