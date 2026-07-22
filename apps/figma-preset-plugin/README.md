# Shadcn Preset Variables Plugin

Small Figma plugin scaffold that turns a canonical shadcn preset code into a
local Figma variable collection.

## What it generates

- `Light` and `Dark` modes
- color variables for the merged semantic theme tokens
- string variables for preset metadata, fonts, and radius

## Build

```bash
pnpm --filter=figma-preset-plugin build
```

Then import `apps/figma-preset-plugin/manifest.json` into Figma as a local
plugin.

## Notes

- The plugin decodes preset codes from the shared preset source.
- Theme token values are built from the same theme data used in this repo.
- This first pass focuses on variables, not recreating full `style-*`
  component styling inside Figma.
