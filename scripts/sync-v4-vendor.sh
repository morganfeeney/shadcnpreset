#!/usr/bin/env bash
# Re-copy the v4 registry's theme + style assets from a shadcn-ui/ui checkout.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UPSTREAM="${SHADCN_UI_PATH:?run via pnpm sync:v4-vendor, or set SHADCN_UI_PATH to a shadcn-ui/ui checkout}"
SRC_STYLES="$UPSTREAM/apps/v4/registry/styles"
SRC_THEMES="$UPSTREAM/apps/v4/registry/themes.ts"
DEST="$ROOT/apps/shadcnpreset/vendor/v4/registry"

if [[ ! -d "$SRC_STYLES" || ! -f "$SRC_THEMES" ]]; then
  echo "sync-v4-vendor: shadcn/ui assets not found at $UPSTREAM" >&2
  echo "Run via pnpm sync:v4-vendor, or set SHADCN_UI_PATH to a shadcn-ui/ui checkout." >&2
  exit 1
fi

mkdir -p "$DEST/styles"
cp "$SRC_STYLES"/style-*.css "$DEST/styles/"
cp "$SRC_THEMES" "$DEST/themes.ts"
echo "sync-v4-vendor: updated $DEST from $UPSTREAM"
