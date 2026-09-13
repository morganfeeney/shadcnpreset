import {
  FeatureStack,
  FeatureStackContent,
  FeatureStackDescription,
  FeatureStackHeader,
  FeatureStackMedia,
  FeatureStackTitle,
} from "@/components/shadcncraft-examples/ui/feature-stack"
import {
  SectionHeading,
  SectionHeadingBody,
  SectionHeadingTagline,
  SectionHeadingTitle,
} from "@/components/shadcncraft-examples/ui/section-heading"
import { UIShowcase } from "@/components/shadcncraft-examples/ui/ui-showcase"
import { IconPlaceholder } from "@/components/icon-placeholder"

export function Benefits1() {
  return (
    <section className="overflow-x-clip py-5 lg:py-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 lg:px-6">
        {/* Section Heading */}
        <SectionHeading className="mx-auto w-full max-w-3xl md:items-center md:text-center">
          <SectionHeadingTagline>Benefits</SectionHeadingTagline>
          <SectionHeadingTitle>
            Your AI Edge in Every Project
          </SectionHeadingTitle>
          <SectionHeadingBody>
            Acme Inc. keeps your workflow smooth and your team aligned, cutting
            out the noise so you can deliver stronger results in less time.
          </SectionHeadingBody>
        </SectionHeading>

        {/* Features */}
        <div className="flex w-full flex-col gap-7">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="grid items-center gap-4 md:grid-cols-2 lg:gap-6 md:[&:nth-child(even)_[data-slot='feature-image']]:order-first md:[&:nth-child(even)_[data-slot='feature-image']]:justify-self-end"
            >
              <FeatureStack alignment="left" size="lg">
                <FeatureStackMedia variant="featured">
                  {feature.icon}
                </FeatureStackMedia>
                <FeatureStackHeader>
                  <FeatureStackTitle>{feature.title}</FeatureStackTitle>
                  <FeatureStackDescription>
                    {feature.description}
                  </FeatureStackDescription>
                </FeatureStackHeader>
                <FeatureStackContent>
                  <ul className="flex flex-col gap-2.5">
                    {feature.items.map((item) => (
                      <ListItem key={item}>{item}</ListItem>
                    ))}
                  </ul>
                </FeatureStackContent>
              </FeatureStack>

              <div data-slot="feature-image" className="lg:py-4">
                <UIShowcase className="max-md:mx-auto md:w-150 lg:w-200">
                  <img
                    src={feature.imageLight}
                    className="size-full object-cover dark:hidden"
                    alt={feature.title}
                  />
                  <img
                    src={feature.imageDark}
                    className="hidden size-full object-cover dark:block"
                    alt={feature.title}
                  />
                </UIShowcase>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-1.5">
      <IconPlaceholder
        lucide="CircleCheck"
        tabler="IconCircleCheck"
        hugeicons="CheckmarkCircle02Icon"
        phosphor="CheckCircleIcon"
        remixicon="RiCheckboxCircleLine"
        className="mt-1 size-5 shrink-0"
      />
      <span className="text-lg">{children}</span>
    </li>
  )
}

const features = [
  {
    icon: (
      <IconPlaceholder
        lucide="Activity"
        tabler="IconActivity"
        hugeicons="Activity01Icon"
        phosphor="ActivityIcon"
        remixicon="RiPulseLine"
      />
    ),
    title: "Smarter Analytics",
    description:
      "Turn data into clarity with AI-powered insights that help you act faster and more confidently.",
    items: [
      "Automated dashboards with zero setup",
      "Real-time tracking and reporting",
      "Clear recommendations for next steps",
    ],
    imageLight:
      "https://assets.shadcncraft.com/registry/dashboard-block-light.webp",
    imageDark:
      "https://assets.shadcncraft.com/registry/dashboard-block-dark.webp",
  },
  {
    icon: (
      <IconPlaceholder
        lucide="Workflow"
        tabler="IconGitBranch"
        hugeicons="WorkflowCircle01Icon"
        phosphor="FlowArrowIcon"
        remixicon="RiGitBranchLine"
      />
    ),
    title: "Seamless Workflow",
    description:
      "Stay in the zone without constant context switching across apps and tools.",
    items: [
      "Integrated project and task management",
      "Instant syncing across your existing stack",
      "Focus-first design to minimize distractions",
    ],
    imageLight:
      "https://assets.shadcncraft.com/registry/dashboard-block-light.webp",
    imageDark:
      "https://assets.shadcncraft.com/registry/dashboard-block-dark.webp",
  },
  {
    icon: (
      <IconPlaceholder
        lucide="Users"
        tabler="IconUsers"
        hugeicons="UserGroupIcon"
        phosphor="UsersIcon"
        remixicon="RiGroupLine"
      />
    ),
    title: "Team Alignment",
    description:
      "Keep everyone on the same page with a single source of truth for projects and decisions.",
    items: [
      "Shared workspaces for cross-team visibility",
      "Role-specific views for clarity and efficiency",
      "Easy collaboration without messy handovers",
    ],
    imageLight:
      "https://assets.shadcncraft.com/registry/dashboard-block-light.webp",
    imageDark:
      "https://assets.shadcncraft.com/registry/dashboard-block-dark.webp",
  },
]
