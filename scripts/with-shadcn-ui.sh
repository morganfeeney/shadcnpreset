#!/usr/bin/env bash
# Runs a command with SHADCN_UI_PATH pointing at a shadcn-ui/ui checkout.
# Unless SHADCN_UI_PATH is already set, clones upstream main (latest commit,
# only the synced paths) into a temp dir for the run and removes it afterwards.
set -euo pipefail

if [[ -z "${SHADCN_UI_PATH:-}" ]]; then
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT
  git clone --quiet --depth 1 --filter=blob:none --sparse \
    https://github.com/shadcn-ui/ui.git "$tmp"
  git -C "$tmp" sparse-checkout set --no-cone \
    /apps/v4/registry/styles/ \
    /apps/v4/registry/themes.ts \
    /apps/v4/registry/bases/base/ui/
  export SHADCN_UI_PATH="$tmp"
fi

echo "shadcn/ui: $(git -C "$SHADCN_UI_PATH" log -1 --format='%h %ad %s' --date=short 2>/dev/null || echo "$SHADCN_UI_PATH")"

"$@"
