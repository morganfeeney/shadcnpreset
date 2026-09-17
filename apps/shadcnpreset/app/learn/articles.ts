import { allLearns } from "content-collections"

export const LEARN_ARTICLES = [...allLearns].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
)

export function getLearnArticle(slug: string) {
  return LEARN_ARTICLES.find((article) => article.slug === slug)
}
