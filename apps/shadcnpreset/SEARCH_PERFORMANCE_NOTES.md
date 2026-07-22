# Search Performance Notes

## Summary

The current search slowness is caused by candidate generation, not by the network request, React Query, or the result rendering.

The main bottleneck is the combination of:

- `apps/shadcnpreset/lib/preset-smart-search.ts`
- `apps/shadcnpreset/lib/preset-catalog.ts`

Search currently samples pages across the full synthetic preset universe and calls `getPresetPage()` for each sampled page. That synthetic universe is extremely large, and `getPresetPage()` becomes expensive for deep offsets.

## What Was Measured

Direct in-process timings for the current smart search implementation:

- `modern serif green`: about `13.9s`
- `pink`: about `9.7s`
- `funky`: about `13.6s`

Direct timings for `getPresetPage()`:

- page `1`: about `0.6ms`
- a middle page: about `867ms`
- the last page: about `1553ms`

These timings show that the cost is dominated by generating sampled candidate pages from deep inside the preset space.

## Root Cause

`getPresetPage()` does not jump directly to a requested offset. It iterates nested loops until it reaches the target range.

That means:

- early pages are cheap
- middle pages are much slower
- late pages are even slower

Search currently does this repeatedly during candidate generation, which makes even simple one-word queries slow.

## Current Search Status

The simpler heuristic scorer is a better foundation than the more experimental rewrites.

Useful characteristics of the current version:

- straightforward tokenization
- explicit token hints
- broad candidate pool
- MMR diversity instead of rigid bucketing

That scorer is good enough to keep for now. The real issue is the size and cost of the candidate source.

## Recommended Fix

Replace query-time universe sampling with a bounded search corpus.

Instead of searching the full generated preset universe on every query:

1. Build a bounded corpus of plausible presets.
2. Rank only inside that corpus.
3. Keep the current simple scorer and MMR diversity.

## Proposed Corpus

Suggested sources:

- loved presets from the database
- a bounded sampled set from the generated catalog
- optionally a few curated/default seed presets

Suggested corpus size:

- `2,000` to `5,000` presets

This should be large enough for variety and small enough for fast ranking.

## Recommended Implementation Steps

### 1. Add a search corpus helper

Suggested file:

- `apps/shadcnpreset/lib/search-corpus.ts`

Suggested responsibilities:

- build and return a bounded `PresetPageItem[]`
- dedupe by preset `code`
- optionally diversify by `style|theme|font|iconLibrary|radius`

### 2. Change search to use the corpus

Update:

- `apps/shadcnpreset/lib/search-data.ts`

Current behavior:

- calls `getSmartPresetResults(query, {}, neededCount)` over sampled pages from the full synthetic space

Target behavior:

1. load/build the corpus
2. rank corpus items with the current heuristic scorer
3. return top `SEARCH_PAGE_SIZE`

### 3. Keep the current scorer

Do not redesign the scorer again until the corpus fix is in place and measured.

The simpler version in:

- `apps/shadcnpreset/lib/preset-smart-search.ts`

is a reasonable ranking layer once the candidate set is bounded.

## Validation Plan

After the corpus approach is implemented:

Test queries:

- `pink`
- `modern serif green`
- `funky`
- `minimal dark`
- `hero icons`

Measure:

- total search latency
- server-side execution time
- result quality

Expected outcome:

- search becomes predictably fast
- result quality is easier to tune
- search no longer depends on expensive deep `getPresetPage()` traversal

## Nice-To-Have Follow-Ups

After the corpus fix:

- dedupe repeated query tokens in `tokenize()`
- add a few more supported vibe words in `TOKEN_HINTS`
- improve empty-state messaging for unsupported terms
- optionally add score-debug output during development

## Final Recommendation

The next step is not another scoring rewrite.

The next step is to:

1. build a bounded search corpus
2. rank within that corpus
3. keep the current heuristic scorer

That should turn search from a multi-second operation into something much more practical and stable.
