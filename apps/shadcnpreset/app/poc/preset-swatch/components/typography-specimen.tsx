import { cn } from "@/lib/utils"

interface TypographySpecimenProps {
  type: "heading" | "body"
  font: string
}

export function TypographySpecimen({ type, font }: TypographySpecimenProps) {
  return (
    <div className="@container grid gap-1 rounded-md bg-muted p-2 text-muted-foreground">
      <div className="flex flex-wrap justify-between gap-x-2 text-xs">
        <div>{type}</div>
        <div>{font}</div>
      </div>
      <div
        className={cn(
          "justify-self-end text-6xl text-foreground",
          type === "heading" && "cn-font-heading"
        )}
      >
        Aa
      </div>
    </div>
  )
}
