import { ReactNode } from "react"
import { CodeXml, FrameIcon, HistoryIcon, LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Container } from "@/components/zippystarter/container"
import { FadeIn, FadeInStagger } from "@/components/zippystarter/fade-in"
import { Link } from "@/components/zippystarter/link"

interface Features1Props {
  title: string
  description: string
  icon: LucideIcon
}

const FEATURES: Features1Props[] = [
  {
    title: "Bespoke UI Templates",
    description:
      "Pre-built, production-ready templates that adapt to your style and stack — no pixel-pushing required.",
    icon: CodeXml,
  },
  {
    title: "Content-Filled Mockups",
    description:
      "Auto-generate rich, real-feeling content and data for your UI so your designs never feel half-finished.",
    icon: FrameIcon,
  },
  {
    title: "Fast Frontend Scaffolding",
    description:
      "Generate clean, structured code with built-in responsiveness and accessibility — no boilerplate bloat.",
    icon: HistoryIcon,
  },
]

function Feature({ title, description, icon }: Features1Props) {
  const Icon = icon
  return (
    <Card className="gap-4 rounded-3xl shadow-none">
      <CardHeader className="gap-4">
        <Icon className="size-8 text-primary" />
        <p className="text-xl font-display tracking-tight">{title}</p>
      </CardHeader>
      <CardContent>
        <p className="text-base text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

interface Features11Props {
  title?: ReactNode
  badge?: string
  description?: string
  features?: Features1Props[]
  className?: string
}

export function Features1({
  title = (
    <p className="text-3xl font-display tracking-tight">
      Features that{" "}
      <span className="inline-flex -skew-x-[12deg] transform text-primary">
        really
      </span>{" "}
      work
    </p>
  ),
  badge = "features",
  description = "Deepsmart gives you the kind of templates and tools that just work — no bloat, no filler, no waiting for design inspiration to strike. Try it today!",
  features = FEATURES,
  className,
}: Features11Props) {
  return (
    <Container
      className="mx-auto grid max-w-7xl grid-cols-2 items-start gap-8 py-16 md:py-24"
      wrapperClassName={className}
    >
      <div className="grid gap-4">
        <Badge variant="outline" className="rounded-full">
          {badge}
        </Badge>
        {title}
        <p className="max-w-[80ch] text-lg text-balance text-muted-foreground">
          {description}
        </p>
      </div>
      <FadeInStagger>
        <div className="@container">
          <div className="grid gap-4 @2xl:grid-cols-2">
            {features.map((feature) => (
              <FadeIn key={feature.title} className="grid">
                <Link href="#" className="grid">
                  <Feature {...feature} />
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </FadeInStagger>
    </Container>
  )
}
