#!/usr/bin/env bash
# Re-copy create/v4 theme + style assets from the sibling fork monorepo.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FORK="${SHADCNPRESET_FORK_PATH:-$ROOT/../shadcnpreset}"
SRC_STYLES="$FORK/apps/v4/registry/styles"
SRC_THEMES="$FORK/apps/v4/registry/themes.ts"
DEST="$ROOT/vendor/v4/registry"

if [[ ! -d "$SRC_STYLES" || ! -f "$SRC_THEMES" ]]; then
  echo "sync-v4-vendor: fork assets not found at $FORK" >&2
  echo "Set SHADCNPRESET_FORK_PATH to your shadcn/ui fork clone (default: \$REPO_ROOT/../shadcnpreset)." >&2
  exit 1
fi

mkdir -p "$DEST/styles"
cp "$SRC_STYLES"/style-*.css "$DEST/styles/"
cp "$SRC_THEMES" "$DEST/themes.ts"
echo "sync-v4-vendor: updated $DEST from $FORK"
