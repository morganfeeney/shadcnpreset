# Agent Notes

- For preset light/dark themed surfaces, follow [`PRESET_LIGHT_DARK_STYLING_GUIDE.md`](./PRESET_LIGHT_DARK_STYLING_GUIDE.md).
- Product app lives in `apps/shadcnpreset`. There is no shadcn/ui fork or create/customizer: every preset preview view (including View 1/2, `preview` and `preview-02`) is a local `/preset-preview/<example>` page built on `components/cn-ui`. v4 registry assets (style CSS, `themes.ts`) live under `apps/shadcnpreset/vendor/v4/registry`, synced from shadcn-ui/ui with `pnpm sync:v4-vendor`, and `components/cn-ui` with `pnpm sync:cn-ui` (both clone upstream `main` on demand via `scripts/with-shadcn-ui.sh`; set `SHADCN_UI_PATH` to use a local checkout). `@/registry/*` aliases there.
- Prefer `@/` imports inside `apps/shadcnpreset`. Do not re-export types through component files.
