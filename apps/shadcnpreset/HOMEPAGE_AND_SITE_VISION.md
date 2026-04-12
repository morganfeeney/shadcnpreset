# Homepage & site structure (working plan)

This document captures **direction** for replacing the current home experience with a **marketing / story-driven** site, moving the live preset grid elsewhere, and **deprioritising smart search** in favour of the **AI assistant** flow. Use it to align implementation tasks.

---

## Goals

1. **Sell the product** — The homepage should explain **what shadcn/preset is**, why it matters, and **feature the AI assistant** as the primary way to explore presets.
2. **No smart search as a hero** — We are **moving away from smart search** as a core surface. Any remaining search-like behaviour is secondary (see below).
3. **Block-based homepage** — Each section has a **clear purpose** (problem, solution, AI, community, etc.). No single giant feed as the default first paint.
4. **Carousel band** — One prominent block with **multiple horizontal carousels**: scroll direction alternates **first row → left**, **second → right**, **third → left** (testimonial / showcase style). Content TBD (quotes, preset highlights, use cases).
5. **Leaderboard page** — **Dedicated route** that shows the **preset cards / feed we currently show on the home page** (community-voted or same data source as today’s list). This becomes the “browse the gallery” destination, not the homepage hero.
6. **Assistant** — Keep a **dedicated assistant page** (`/assistant`) as the main **AI** entry.
7. **Preset code lookup** — Still allow people to **find/open a preset by code** (exact match / navigate to preset). **Lower priority** than the AI story; can be a small search field, footer link, or secondary CTA—not the homepage focus.

---

## Information architecture (sketch)

| Route / area        | Purpose |
| ------------------- | ------- |
| **`/`**             | Marketing: features, story, carousels, CTAs → assistant + leaderboard. |
| **`/assistant`**    | Primary **AI** experience (conversational preset generation). |
| **`/leaderboard`** (name TBD) | **Gallery of preset cards** (current homepage feed behaviour). |
| **Preset by code**  | Secondary: jump to `/preset/[code]` or lightweight code search—details in implementation. |

Exact paths (`/leaderboard` vs `/gallery` vs `/presets`) can be decided during build; the doc assumes **one** clear gallery page fed by today’s home feed logic.

---

## Homepage: section intent (outline)

Sections are **blocks**; order and copy will evolve.

- **Hero** — Headline + subcopy selling the idea; primary CTA → **Try the assistant**; secondary → **Browse leaderboard** (or similar).
- **Features / value** — Bullet or card list: community presets, real previews, AI-driven facet → preset codes, etc.
- **Carousel block** — Multiple horizontal carousels with **alternating scroll direction** (L / R / L). Optional: link rows to real presets or quotes.
- **Further CTAs** — Reinforce assistant vs browse.
- **Footer** — Resources, preset code entry if we keep it minimal, legal/social as today.

---

## What to remove or demote

- **Smart search** as a primary mode on the home hero and main nav emphasis.
- **Homepage = endless card grid** — that behaviour **moves** to the leaderboard (or equivalent) page.

---

## Open decisions (for implementation tickets)

- Final **URL** and **nav label** for the gallery/leaderboard page.
- **Carousel** content source (static copy vs API vs featured presets).
- Whether **preset code** search lives in the header, footer, or a small widget on one block.
- Redirects: e.g. old `/search/smart/...` usage—**redirect, hide, or sunset** per product choice (separate task).

---

## Related docs

- `CATALOG_INTENT_VISION.md` — AI / facet / preset encoding vision (assistant path).
- `SEARCH_PERFORMANCE_NOTES.md` — Legacy context for old search/corpus (may become historical if smart search is retired).
