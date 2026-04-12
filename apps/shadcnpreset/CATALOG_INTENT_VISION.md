# Catalog intent & preset matching

Reference for **how preset discovery should work**: interpret user language, map it to **real catalog facets**, then **produce a valid preset** (encoded config / preset code). Not a spec for a particular route name or UI label.

---

## Non‑negotiable: independence from legacy “smart search”

**Do not preserve existing mechanisms because they exist.** If the current embedding‑heavy search path (`lib/search/data`, corpus + vectors, “smart” query string → ranker) **does not serve this vision**, **do not build on it** — **omit it, replace it, or leave it as a separate legacy path.**

- The vision is **not** “incrementally improve smart search.” It is **facet‑grounded outcomes** (see below). Reusing a broken ranker to save work **conflicts** with that and wastes effort.
- **Embeddings / vector similarity** are **optional**. They may remain useful for **exploratory** “browse something like this” later — they are **not** a requirement for the primary conversational flow.
- Implementation freedom: **new APIs, new assistant payloads, encode → return** are all acceptable. **Compatibility with the old smart search pipeline is not a goal** unless we explicitly choose it.

---

## Vision

1. **Ordinary language → concrete preset fields.** The user says what they want in normal words (e.g. “dark minimal dashboard”). The system **fills in the real preset knobs** — style, shell, colours, fonts, icons, etc. — using **only values the catalog allows**, not a vague paraphrase meant for search.
2. **Catalog is ground truth.** Facets map to `**PresetConfig`** (and then `**encodePreset**`). The LLM **selects among supplied enums** (with glosses); **validation + defaults** fill the tuple; **the code is generated from that tuple** — not retrieved by vibes from a vector index.
3. **Primary outcome: a preset code (and config).** The simple loop: **conversation → facets → `encodePreset` → return result** (one or a few codes if we allow alternates). That is **simpler and truer** to the encoding model than ranking thousands of presets by embedding similarity.
4. **Facet vocabulary must be taught.** Allowed ids plus short natural‑language glosses per important enum. The model does not invent new facet ids.

---

## Interpreting what users mean


| Dimension         | Intent                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Light / dark**  | Dominantly dark or light surfaces, palette character — reflected in real fields (e.g. neutrals, shell / menu choices), not a vague “dark” string alone. |
| **Domain / vibe** | “Fintech dashboard,” “minimal,” etc. → **concrete** style, density, font, icon choices from **your** enums.                                             |
| **Pipeline**      | **natural language → structured intent → full facet tuple → preset code** — not “one paraphrase string for an embedding ranker.”                        |


---

## Why the old path felt wrong (context only)

Ranking presets mainly by **query embedding vs preset text** does not reliably encode palette discipline, industry look, or discrete style choice. Handing chat off with **only a search string** repeated the **same** mechanism. That stack is **not** the foundation for the vision unless we **explicitly** keep a separate, honest “explore” mode.

---

## Target shape (aligned with vision)

- **Structured intent** → complete or default‑filled `**PresetConfig`** → `**encodePreset**` → return to the user (preview / link / copy code as the product requires).
- **Optional:** multiple candidate configs when language is ambiguous; clarifying questions when confidence is low.
- **Not required:** blending with `getSemanticRelevanceScores`, search corpus ranking, or “embeddingQuery” as the main artifact — **only if** we still want a secondary browse path.

---

## Implementation (phased — no obligation to touch legacy search)


| Phase                      | Focus                                                                                                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**                      | **Intent schema** (Zod) → full facet tuple; `**encodePreset`** on the server; assistant/API returns **preset code + decoded summary**. Wire UI to that. **Ignore** old smart search wiring if it fights this. |
| **2**                      | Polish: alternates, confidence, glosses in prompts, eval of bad tuples.                                                                                                                                       |
| **Later (only if needed)** | Separate **exploratory** similarity or browse — clearly labeled, **not** the same as “chat gave me a preset.”                                                                                                 |


---

## See also

- `SEARCH_PERFORMANCE_NOTES.md` — historical notes on corpus size/latency for **legacy** search paths; **orthogonal** to the facet‑generation vision above.

