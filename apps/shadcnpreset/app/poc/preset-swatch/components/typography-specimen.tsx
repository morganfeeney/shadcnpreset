import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/poc/ui/card"
import { CardHeader } from "@/components/ui/card"

interface TypographySpecimenProps {
  type: "heading" | "body"
  font: string
}

export function TypographySpecimen({ type, font }: TypographySpecimenProps) {
  return (
    <Card className="@container grid gap-1">
      <CardHeader className="grid gap-0 text-xs capitalize">
        <div className="truncate text-muted-foreground">{type}</div>
        <div className="truncate text-muted-foreground">{font}</div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "justify-self-start text-7xl text-foreground",
            type === "body" && "font-sans",
            type === "heading" && "cn-font-heading"
          )}
        >
          Aa
        </div>
      </CardContent>
    </Card>
  )
}
