import { ReactNode } from "react"
import {
  CodeXml,
  FrameIcon,
  HistoryIcon,
  LucideIcon,
  LucideBrainCog,
  Paintbrush2,
  Edit3Icon,
  Bookmark,
  Heart,
} from "lucide-react"
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
    title: "AI-driven results",
    description:
      "Describe what you want in plain English. Get relevant shadcn presets you can compare instantly.",
    icon: LucideBrainCog,
  },
  {
    title: "Search by vibe or intent",
    description:
      "Go beyond keywords. Find presets by feel—clean, bold, minimal, or anything in between.",
    icon: FrameIcon,
  },
  {
    title: "Your results, saved",
    description:
      "Every conversation is saved automatically, so you can revisit, compare, and refine without starting over.",
    icon: Bookmark,
  },
  {
    title: "Refine with AI",
    description:
      "Tweak your results by adjusting the prompt. Narrow down styles, layouts, or components in seconds.",
    icon: Paintbrush2,
  },
  {
    title: "Built on real presets",
    description:
      "No fake outputs. Every result is based on actual shadcn presets you can preview and use.",
    icon: HistoryIcon,
  },
  {
    title: "Community presets",
    description:
      "Explore presets voted for by the community. Find inspiration, remix presets, and share your own.",
    icon: Heart,
  },
]
function Feature({ title, description, icon }: Features1Props) {
  const Icon = icon
  return (
    <Card>
      <CardHeader className="gap-4">
        {Icon ? <Icon className="size-6 text-primary" /> : null}
        <p className="text-xl font-display tracking-tighter">{title}</p>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
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
      Powerful search for{" "}
      <span className="inline-flex -skew-x-[12deg] transform text-primary">
        every
      </span>{" "}
      kind of builder
    </p>
  ),
  badge = "features",
  description = "Stop scrolling and start building. Describe what you want, search by feel, and let AI surface the right shadcn presets — then save, compare, and refine until perfect.",
  features = FEATURES,
  className,
}: Features11Props) {
  return (
    <Container
      className="mx-auto grid max-w-7xl items-start gap-8 py-16 md:py-24 xl:grid-cols-2"
      wrapperClassName={className}
    >
      <div className="sticky top-8 grid gap-4">
        <Badge variant="secondary" className="rounded-full">
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
                <Feature {...feature} />
              </FadeIn>
            ))}
          </div>
        </div>
      </FadeInStagger>
    </Container>
  )
}
