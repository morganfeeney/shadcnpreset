import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MDXContent } from "@content-collections/mdx/react"
import { format, parseISO } from "date-fns"

import { getLearnArticle, LEARN_ARTICLES } from "@/app/learn/articles"
import { getLearnArticleHref } from "@/app/learn/learn"
import { Badge } from "@/components/ui/badge"
import { buildPageMetadata } from "@/lib/page-metadata"
import { mdxDocumentationComponents } from "@/mdx-components"

type LearnArticlePageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return LEARN_ARTICLES.map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({
  params,
}: LearnArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getLearnArticle(slug)

  if (!article) {
    notFound()
  }

  const metadata = buildPageMetadata({
    title: article.title,
    description: article.description,
    path: getLearnArticleHref(article.slug),
    image: "route",
  })
  const isDraft = article.status === "draft"

  return {
    ...metadata,
    robots: isDraft ? { index: false, follow: false } : metadata.robots,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: article.date,
      modifiedTime: article.updated ?? article.date,
    },
  }
}

function formatDate(date: string) {
  return format(parseISO(date), "dd MMM yyyy")
}

export default async function LearnArticlePage({
  params,
}: LearnArticlePageProps) {
  const { slug } = await params
  const article = getLearnArticle(slug)

  if (!article) {
    notFound()
  }

  const isDraft = article.status === "draft"

  return (
    <main className="py-8 md:py-24">
      <article className="mx-auto max-w-[56ch] md:max-w-[66ch]">
        <div className="markdown text-foreground/70">
          <header className="grid">
            <p className="mt-0 flex flex-wrap items-center gap-2 font-mono text-xs font-medium text-muted-foreground uppercase">
              {isDraft ? <Badge variant="default">Draft</Badge> : null}
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              {article.updated ? (
                <>
                  {" · Updated "}
                  <time dateTime={article.updated}>
                    {formatDate(article.updated)}
                  </time>
                </>
              ) : null}
            </p>
            <h1 className="text-3xl font-display text-balance text-foreground md:text-4xl">
              {article.title}
            </h1>
          </header>
          <MDXContent
            code={article.body}
            components={mdxDocumentationComponents}
          />
        </div>
      </article>
    </main>
  )
}
