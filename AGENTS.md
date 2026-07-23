# Agent Notes

- For preset light/dark themed surfaces, follow [`PRESET_LIGHT_DARK_STYLING_GUIDE.md`](./PRESET_LIGHT_DARK_STYLING_GUIDE.md).
- Product app lives in `apps/shadcnpreset`. Create/customizer is a separate fork; v4 registry assets live under `apps/shadcnpreset/vendor/v4/registry` (`pnpm sync:v4-vendor`). `@/registry/*` aliases there.
- Prefer `@/` imports inside `apps/shadcnpreset`. Do not re-export types through component files.
