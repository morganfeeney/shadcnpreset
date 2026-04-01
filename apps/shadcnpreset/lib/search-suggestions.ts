/**
 * Curated smart-search examples for empty states and discovery.
 * Queries are chosen to match common facets (icons, fonts, vibes) in the corpus.
 */
export const SMART_SEARCH_SUGGESTIONS: readonly {
  label: string
  query: string
}[] = [
  { label: "Pink & playful", query: "pink playful" },
  { label: "Minimal dark", query: "minimal dark" },
  { label: "Hugeicons", query: "hugeicons pink" },
  { label: "Dashboard / SaaS", query: "dashboard saas" },
  { label: "Modern serif + green", query: "modern serif green" },
  { label: "Hero icons", query: "hero icons" },
] as const
