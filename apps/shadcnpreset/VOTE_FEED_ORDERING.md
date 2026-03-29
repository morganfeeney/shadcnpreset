# Vote Feed Ordering Contract

This document defines exactly how homepage preset ordering works.

## Global ordering

The global feed order is deterministic and built server-side in this sequence:

1. Loved presets first (presets with at least 1 vote).
2. Non-loved presets next (presets with 0 votes).

## Loved preset sorting

Loved presets are sorted by:

1. Vote count descending (more votes first).
2. Preset code ascending when vote counts are equal.

## Non-loved preset sorting

Non-loved presets are sorted by the default catalog order.

## Pagination

Pagination is applied after the global ordering is built:

- Page 1 is the first slice of the globally ordered list.
- Page 2 is the next slice, and so on.

## Vote/unvote behavior

When a user votes:

- If the preset was non-loved, it enters the loved block.
- Its loved-block position is determined by vote count, then code tie-break.

When a user unvotes:

- If the preset reaches 0 votes, it leaves the loved block.
- It returns to the non-loved block in default catalog order.

After every vote/unvote mutation, the homepage feed query is invalidated and
refetched. This ensures feed ordering is recomputed from the same server rules
for both vote and unvote actions.

## Determinism guarantees

Given the same database vote state, ordering is always the same.
There is no random client-side tie-break for feed ordering.
