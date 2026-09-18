import { allLearns } from "content-collections"

import {
  isLearnArticleVisible,
  showLearnDrafts,
  type LearnStatus,
} from "@/lib/learn-visibility"

function sortLearnArticles<T extends { date: string }>(articles: T[]) {
  return [...articles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export const ALL_LEARN_ARTICLES = sortLearnArticles(allLearns)

export const PUBLISHED_LEARN_ARTICLES = ALL_LEARN_ARTICLES.filter(
  (article) => article.status === "published"
)

export const LEARN_ARTICLES = ALL_LEARN_ARTICLES.filter((article) =>
  isLearnArticleVisible(article.status as LearnStatus)
)

export function getLearnArticle(slug: string) {
  return LEARN_ARTICLES.find((article) => article.slug === slug)
}

export { showLearnDrafts }
