# shadcnpreset (shadcn/ui fork)

This repository is a **fork of the [shadcn/ui](https://ui.shadcn.com) monorepo** maintained for *
*[shadcnpreset.com](https://shadcnpreset.com)** and related tooling. It contains the upstream CLI, registry/docs app,
and templates, **plus** a Next.js app and v4 integration that connect the site to the embedded theme customizer.

## What’s here

- **`apps/shadcnpreset`** — Next.js app for browsing and voting for your favourite shadcn/ui theme presets (feed, preset
  pages, iframe
  preview of the v4 create experience).
- **`apps/v4`** — shadcn/ui v4 docs/registry site; this fork adds a small **`shadcnpreset-fork`** integration on the
  create flow so preset codes stay in sync with the parent site via `postMessage`.
- **`packages/shadcn`** — the `shadcn` CLI and related packages (as in upstream).

Upstream documentation and component reference: [ui.shadcn.com/docs](https://ui.shadcn.com/docs).

## Developing locally

Use **pnpm** (see root `package.json` for the package manager version).

- Run the v4 app on the URL expected by shadcnpreset (default `http://localhost:4000` — see `NEXT_PUBLIC_V4_URL`).
- Run the shadcnpreset app (e.g. `pnpm shadcnpreset:dev` from the repo root) so the iframe targets your local v4
  instance.

Details on ports, env vars, and how the iframe/postMessage wiring works: [`UPSTREAM.md`](./UPSTREAM.md) and [
`docs/shadcnpreset-fork-integration.md`](./docs/shadcnpreset-fork-integration.md).

## Merging upstream

After merging from upstream shadcn/ui, run:

```bash
pnpm verify:shadcnpreset-fork
