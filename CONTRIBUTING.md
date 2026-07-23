# Contributing

Thanks for your interest in contributing to [shadcnpreset](https://shadcnpreset.com).

Please take a moment to review this guide before opening a pull request, and check existing issues and PRs to avoid duplicating work.

If you need help, reach out to [@morganfeeney](https://x.com/morganfeeney).

## About this repository

This repository is a **pnpm monorepo** for the shadcnpreset product:

| Path | Description |
|------|-------------|
| `apps/shadcnpreset` | Theme discovery platform and developer tools |
| `apps/figma-preset-plugin` | Figma variables plugin |
| `vendor/v4` | Vendored create/theme assets from the shadcn/ui fork |

The create/customizer UI lives in a separate fork of [shadcn/ui](https://github.com/shadcn-ui/ui) and is embedded via iframe (`NEXT_PUBLIC_V4_URL`).

## Development

### Fork and clone

1. Fork this repo
2. Clone your fork:

```bash
git clone https://github.com/your-username/shadcnpreset.git
cd shadcnpreset
```

3. Create a branch:

```bash
git checkout -b my-new-branch
```

4. Install dependencies:

```bash
pnpm install
```

### Run the apps

```bash
pnpm dev
```

For live create/customizer iframes, also run the sibling fork:

```bash
cd ../shadcnpreset   # create fork
pnpm v4:dev          # → http://localhost:4000
```

Copy `apps/shadcnpreset/.env.example` to `apps/shadcnpreset/.env.local` and set secrets as needed.

## Pull requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please keep PRs focused. Prefer small, reviewable changes over large mixed diffs.

## Commit convention

Please follow Conventional Commits where possible:

`category(scope): message`

Common categories: `feat`, `fix`, `refactor`, `docs`, `build`, `test`, `ci`, `chore`.

Example: `feat(web): add contrast checker export`

## Testing

```bash
pnpm test
```

Please ensure tests pass when submitting a pull request. Add tests when you introduce new behaviour.
