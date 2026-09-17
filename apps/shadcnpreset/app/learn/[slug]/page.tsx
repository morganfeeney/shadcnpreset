import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MDXContent } from "@content-collections/mdx/react"
import { format, parseISO } from "date-fns"

import { getLearnArticle, LEARN_ARTICLES } from "@/app/learn/articles"
import { getLearnArticleHref } from "@/app/learn/learn"
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
  })

  return {
    ...metadata,
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

  return (
    <main className="py-8 md:py-24">
      <article className="mx-auto max-w-[56ch] text-sm leading-6 md:max-w-[66ch] md:text-base md:leading-7">
        <div className="markdown text-foreground/70">
          <header className="grid">
            <p className="mt-0 font-mono text-xs font-medium text-muted-foreground uppercase">
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
            <p className="text-foreground/70">{article.description}</p>
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
