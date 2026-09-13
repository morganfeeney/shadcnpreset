/** Affiliate credit shown above each shadcncraft preview. */
export function ShadcncraftCredit({
  label,
  source,
}: {
  label: string
  /** Attribution for the `src` param, e.g. "marketing-preview". */
  source: string
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-2 lg:px-6">
      <p className="text-xs text-muted-foreground">
        {label} from{" "}
        <a
          href={`https://shadcncraft.com?atp=shadcnpreset&src=${source}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-foreground"
        >
          shadcncraft Pro
        </a>
      </p>
    </div>
  )
}
