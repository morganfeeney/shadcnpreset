# Git Workflow (`origin` + `upstream`)

This repo uses two remotes:

- `origin`: your branded repo (`git@github.com:morganfeeney/shadcnpreset.git`)
- `upstream`: official shadcn repo (`git@github.com:shadcn-ui/ui.git`)

## Verify remotes

```bash
git remote -v
```

If needed:

```bash
git remote set-url origin git@github.com:morganfeeney/shadcnpreset.git
git remote set-url upstream git@github.com:shadcn-ui/ui.git
```

## Sync from shadcn (`upstream`) to your repo (`origin`)

```bash
git checkout main
git fetch upstream
git rebase upstream/main
git push origin main
```

## Pull latest from your own repo only

```bash
git checkout main
git pull --rebase origin main
```

## Recommended daily flow

```bash
git fetch origin
git fetch upstream
git checkout main
git rebase upstream/main
git push origin main
```

## Conflict handling during rebase

When Git pauses with conflicts:

1. Resolve files.
2. Stage resolutions.
3. Continue rebase.

```bash
git add <resolved-files>
git rebase --continue
```

### `pnpm-lock.yaml` conflict strategy

`pnpm-lock.yaml` is generated. During rebase, prefer upstream lockfile to reduce manual merging:

```bash
git checkout --ours pnpm-lock.yaml
git add pnpm-lock.yaml
git rebase --continue
```

After rebase completes, regenerate and commit lockfile if needed:

```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: refresh pnpm lockfile after rebase"
```

## Recovery commands

```bash
git status -sb
git rebase --continue
git rebase --abort
```

## Optional: make pulls default to rebase

```bash
git config pull.rebase true
```
