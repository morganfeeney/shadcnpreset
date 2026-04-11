# shadcnpreset (shadcn/ui fork)

**Stop guessing theme combos.** [shadcnpreset.com](https://shadcnpreset.com) is where you **browse real shadcn/ui
presets**, preview them with the actual v4 customizer, **search in plain English**, and **save the ones you love**—then
install the code via the shadcn CLI. Open source, free, built on the stack you already use.

This repo is a **fork of the [shadcn/ui](https://ui.shadcn.com) monorepo**: upstream CLI, registry, and templates, *
*plus** the Next.js app and a tight integration with the v4 create experience so preset pages and the embedded
customizer stay in lockstep.

## What’s in the monorepo

- **`apps/shadcnpreset`** — The product: homepage feed, preset pages, smart search, voting, **My presets**, live iframe
  preview, share-ready OG cards.
- **`apps/v4`** — The v4 docs/registry app; this fork adds **`shadcnpreset-fork`** on the create flow so preset codes
  sync with the parent site via `postMessage` (no copy-paste drift).
- **`packages/shadcn`** — The `shadcn` CLI and related packages (same lineage as upstream).

## Why it’s worth using

| You get                         | What that means                                                                                                                                                                                                                                                            |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Real previews**               | Not screenshots—an embedded v4 **create** experience so you see *your* components under *that* theme.                                                                                                                                                                      |
| **Smart search**                | Type “minimal dark”, “dashboard saas”, “serif green”—facet-aware parsing + full-text ranking + diversity so results feel like a curated gallery.                                                                                                                           |
| **Shareable presets**           | Every preset has a link, rich **Open Graph** cards (dynamic 1200×630 art with swatches + code), and metadata that stays correct when the live preset changes.                                                                                                              |
| **Community signal**            | Vote for presets you’d actually ship; the homepage feed surfaces **what people love** first—see [`VOTE_FEED_ORDERING.md`](./apps/shadcnpreset/VOTE_FEED_ORDERING.md).                                                                                                      |
| **Your shortlist**              | Signed-in users get **My presets**—one place for every preset you’ve hearted, ready to reopen or share.                                                                                                                                                                    |
| **Kept up to date with shadcn** | shadcn ships fast—this isn’t a parallel rewrite, it’s the **same monorepo** with shadcnpreset layered on, so the CLI, registry, and customizer stay in the same lineage as upstream. You get new shadcn work as it lands in the fork, not a stale side-channel theme tool. |

## Features (technical)

### Search

- **Preset code** — Jump straight in with a code (e.g. `b4aRK5K0fb`).
- **Smart search** — Natural language + [MiniSearch](https://github.com/lucaong/minisearch) lexical scores + structured
  facets (colours, typography, icons, radius, themes, …) + MMR-style diversity. Suggested queries on empty states nudge
  discovery.

Details: [`apps/shadcnpreset/SEARCH_PERFORMANCE_NOTES.md`](./apps/shadcnpreset/SEARCH_PERFORMANCE_NOTES.md).

### Voting & My presets

- **Votes** — Authenticated users can upvote presets; counts are stored server-side and **toggle** (heart on, heart
  off). Trying to vote while signed out can trigger sign-in; **session storage** keeps that vote intent across the OAuth
  round-trip so the vote applies after you land back (it is cleared if you browse away before signing in).
- **Homepage ordering** — Presets with at least one vote float to the **“loved”** block, sorted by vote count (then
  code). Zero-vote presets follow in catalog order—so the feed rewards taste, not just recency.
- **My presets** — **`/my-presets`** lists every preset you’ve voted for—your personal library of themes to reuse and
  share.

### Social / Open Graph

- **Dynamic OG images** — `next/og` `ImageResponse` per preset: dark card, brand mark, **colour swatches** (with
  contrast-aware rims for muddy colours), Geist Mono code, theme summary—ready for Slack, X, iMessage.
- **Live metadata** — Client sync keeps `<title>`, canonical, and OG/Twitter tags aligned when the URL updates from the
  iframe.

## Developing locally

Use **pnpm** (version in root `package.json`).

- Run v4 `pnpm v4:dev` (defaults to `http://localhost:4000`, `NEXT_PUBLIC_V4_URL`).
- Run the app: `pnpm shadcnpreset:dev` from the repo root so the iframe hits your local v4 instance.

More: [`UPSTREAM.md`](./UPSTREAM.md), [
`docs/shadcnpreset-fork-integration.md`](./docs/shadcnpreset-fork-integration.md).

## Merging upstream

If you **bring in changes from upstream** shadcn/ui, there is a check script to confirm the shadcnpreset-only wiring did
not get lost in the merge—see [`UPSTREAM.md`](./UPSTREAM.md). It is optional documentation for that workflow, not
something you need for day-to-day dev or for using the site.

## Contributing

Please read the [contributing guide](./CONTRIBUTING.md).

## License

Licensed under the [MIT license](./LICENSE.md).
