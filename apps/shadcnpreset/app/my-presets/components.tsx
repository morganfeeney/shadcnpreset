export function SimpleHeader({ userName }: { userName?: string }) {
  return (
    <div className="grid gap-1 pt-16">
      <h1 className="text-2xl font-display text-foreground">
        {userName ? `${userName}'s` : "My"} presets
      </h1>
      <p className="text-sm text-muted-foreground">
        Browse your favourite shadcn presets.
      </p>
    </div>
  )
}
