import type { Metadata } from "next"

import { LEARN_ARTICLES } from "@/app/learn/articles"
import { getLearnArticleHref, LEARN_PAGE } from "@/app/learn/learn"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { ToolsList } from "@/components/tools-list"
import { buildPageMetadata } from "@/lib/page-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: LEARN_PAGE.title,
  description: LEARN_PAGE.description,
  path: LEARN_PAGE.href,
})

export default function LearnPage() {
  return (
    <div className="grid content-start items-start">
      <PageHeader>
        <PageHeaderHeading className="max-w-4xl">
          {LEARN_PAGE.title}
        </PageHeaderHeading>
        <PageHeaderDescription className="text-muted-foreground">
          {LEARN_PAGE.description}
        </PageHeaderDescription>
      </PageHeader>
      <main className="grid gap-4">
        {LEARN_ARTICLES.length > 0 ? (
          <ToolsList
            tools={LEARN_ARTICLES.map((article) => ({
              href: getLearnArticleHref(article.slug),
              title: article.title,
              description: article.description,
              date: article.date,
              updated: article.updated,
              badge: article.status === "draft" ? "Draft" : undefined,
            }))}
          />
        ) : (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyTitle>No guides published yet</EmptyTitle>
              <EmptyDescription>
                Learn articles stay hidden on the deployed site until their
                frontmatter status is published.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </main>
    </div>
  )
}
