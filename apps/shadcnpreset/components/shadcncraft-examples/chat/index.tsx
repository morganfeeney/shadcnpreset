import type * as React from "react"

import { IconPlaceholder } from "@/components/icon-placeholder"
import { Badge } from "@/components/cn-ui/badge"
import { Bubble, BubbleContent } from "@/components/cn-ui/bubble"
import { Button } from "@/components/cn-ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/cn-ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/cn-ui/input-group"
import { Marker, MarkerContent } from "@/components/cn-ui/marker"
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@/components/cn-ui/message"
import { Separator } from "@/components/cn-ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/cn-ui/tabs"
import { FilePart1 } from "@/components/shadcncraft-examples/ui/file-part-1"
import { ReasoningPart1 } from "@/components/shadcncraft-examples/ui/reasoning-part-1"
import {
  SourcesPart1,
  type Citation,
} from "@/components/shadcncraft-examples/ui/sources-part-1"
import { ToolPart1 } from "@/components/shadcncraft-examples/ui/tool-part-1"
import { WebSearchPart1 } from "@/components/shadcncraft-examples/ui/web-search-part-1"

/**
 * A finished conversation, drawn with shadcncraft's message parts. UI only:
 * nothing streams and nothing is sent. The assistant's answers include real
 * components, so the "generated" UI follows the preset like the chat around it.
 */
export function ChatDemo() {
  return (
    <div className="flex h-svh flex-col bg-background px-2 text-foreground">
      {/* Scrolling clips like the frame edge, so the gutter goes inside it. */}
      <div className="-mx-2 min-h-0 flex-1 overflow-y-auto px-2">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-6">
          <Marker variant="separator">
            <MarkerContent>Today</MarkerContent>
          </Marker>

          <UserMessage>
            What is generative UI? Is it just a chatbot that writes code?
          </UserMessage>

          <AssistantMessage>
            <ReasoningPart1
              part={{
                type: "reasoning",
                state: "done",
                text: "They are asking for the distinction, not a definition. The useful contrast: code generation hands back text to paste elsewhere, generative UI renders components in place. Worth naming what makes it reliable, since that is the part people get wrong.",
              }}
            />
            <WebSearchPart1
              part={{
                type: "tool-web_search",
                toolCallId: "search-1",
                state: "output-available",
                input: { objective: "generative UI with component libraries" },
                output: {},
              }}
            />
            <AnswerText>
              <p>
                Not quite. A chatbot that writes code hands you text to paste
                somewhere else. With generative UI, the model chooses real
                components and fills in their props, and the interface renders
                them right here in the conversation.
              </p>
              <p>Three things make it work well:</p>
              <ul className="flex list-disc flex-col gap-1.5 pl-5">
                <li>
                  <strong className="font-medium">A component library</strong>{" "}
                  the model is allowed to use, so nothing it makes is off-brand.
                </li>
                <li>
                  <strong className="font-medium">Tool calls</strong> that
                  return structured props rather than prose.
                </li>
                <li>
                  <strong className="font-medium">Theme tokens</strong>, so what
                  it renders inherits your colours, radius and fonts.
                </li>
              </ul>
              <p>
                That last one is why it pairs so well with a preset: change the
                preset and every generated component changes with it.
              </p>
            </AnswerText>
            <SourcesPart1 sources={SOURCES} />
            <MessageActions />
          </AssistantMessage>

          <UserMessage
            attachment={
              <FilePart1
                part={{
                  type: "file",
                  mediaType: "application/pdf",
                  filename: "pricing-brief.pdf",
                  url: "",
                }}
              />
            }
          >
            Show me. Make a pricing card for our design tool from this brief.
          </UserMessage>

          <AssistantMessage>
            <ToolPart1
              part={{
                type: "tool-render_component",
                toolCallId: "render-1",
                state: "output-available",
                title: "Generated a pricing card",
                input: {
                  component: "PricingCard",
                  source: "pricing-brief.pdf",
                },
                output: {
                  component: "PricingCard",
                  plan: "Pro",
                  price: { monthly: 24 },
                  features: PRO_FEATURES,
                },
              }}
            />
            <PricingCard>
              <PricingPrice amount={24} />
            </PricingCard>
            <AnswerText>
              <p>
                Here is the Pro plan from your brief. It is built from your
                preset&apos;s card, badge and button, so it already matches the
                rest of your product.
              </p>
            </AnswerText>
            <MessageActions />
          </AssistantMessage>

          <UserMessage>
            Nice. Can you add a monthly and annual switch, and show the saving?
          </UserMessage>

          <AssistantMessage>
            <ReasoningPart1
              part={{
                type: "reasoning",
                state: "done",
                text: "Default to annual: it is the plan they want to sell, and the saving is only visible on that tab. Keep the card the same size on both tabs so the switch does not make it jump.",
              }}
            />
            <PricingCard
              billing={
                <Tabs defaultValue="annual">
                  <TabsList className="w-full">
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="annual">Annual</TabsTrigger>
                  </TabsList>
                  <TabsContent value="monthly" className="pt-4">
                    <PricingPrice amount={24} />
                  </TabsContent>
                  <TabsContent value="annual" className="pt-4">
                    <PricingPrice amount={19} saving="Save 20%" />
                  </TabsContent>
                </Tabs>
              }
            />
            <AnswerText>
              <p>
                Done. Annual is selected by default and shows the saving next to
                the price. Monthly is one tap away, and the card keeps its size
                when you switch.
              </p>
            </AnswerText>
            <MessageActions />
          </AssistantMessage>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl shrink-0">
        <Composer />
      </div>
      <p className="shrink-0 py-2.5 text-center text-xs text-balance text-muted-foreground">
        AI can make mistakes. Verify important information.
      </p>
    </div>
  )
}

const SOURCES: Citation[] = [
  {
    id: "ai-sdk",
    title: "Generative user interfaces",
    url: "https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces",
  },
  {
    id: "shadcn-registry",
    title: "Registry",
    url: "https://ui.shadcn.com/docs/registry",
  },
  {
    id: "shadcn-theming",
    title: "Theming",
    url: "https://ui.shadcn.com/docs/theming",
  },
]

const PRO_FEATURES = [
  "Unlimited projects",
  "Shared component libraries",
  "Version history",
]

function UserMessage({
  attachment,
  children,
}: {
  attachment?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Message align="end">
      <MessageContent className="items-end">
        {attachment}
        <Bubble variant="default">
          <BubbleContent>{children}</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}

function AssistantMessage({ children }: { children: React.ReactNode }) {
  return (
    <Message>
      <MessageContent>{children}</MessageContent>
    </Message>
  )
}

function AnswerText({ children }: { children: React.ReactNode }) {
  return (
    <Bubble variant="ghost">
      <BubbleContent className="flex flex-col gap-3">{children}</BubbleContent>
    </Bubble>
  )
}

function MessageActions() {
  return (
    <MessageFooter className="gap-0.5">
      <Button variant="ghost" size="icon-sm" aria-label="Copy message">
        <IconPlaceholder
          lucide="Copy"
          tabler="IconCopy"
          hugeicons="Copy01Icon"
          phosphor="CopyIcon"
          remixicon="RiFileCopyLine"
        />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Regenerate response">
        <IconPlaceholder
          lucide="RefreshCw"
          tabler="IconRefresh"
          hugeicons="RefreshIcon"
          phosphor="ArrowsClockwiseIcon"
          remixicon="RiRefreshLine"
        />
      </Button>
    </MessageFooter>
  )
}

/** The component the assistant "generated", shared by both versions of it. */
function PricingCard({
  billing,
  children,
}: {
  billing?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <Card className="my-2 w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Pro</CardTitle>
          <Badge>Most popular</Badge>
        </div>
        <CardDescription>
          For teams designing and shipping together.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {billing ?? children}
        <Separator />
        <ul className="flex flex-col gap-2 text-sm">
          {PRO_FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <IconPlaceholder
                lucide="Check"
                tabler="IconCheck"
                hugeicons="Tick02Icon"
                phosphor="CheckIcon"
                remixicon="RiCheckLine"
                className="size-4 text-primary"
              />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Start free trial</Button>
      </CardFooter>
    </Card>
  )
}

function PricingPrice({ amount, saving }: { amount: number; saving?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-4xl font-semibold tracking-tight tabular-nums">
        ${amount}
      </span>
      <span className="text-sm text-muted-foreground">per seat / month</span>
      {saving ? (
        <Badge variant="secondary" className="ml-auto">
          {saving}
        </Badge>
      ) : null}
    </div>
  )
}

/** The input, drawn but inert: the preview only needs to show it. */
function Composer() {
  return (
    <InputGroup>
      <InputGroupTextarea
        placeholder="Ask for a change..."
        className="min-h-0 px-4.5 py-2"
      />
      <InputGroupAddon align="block-end" className="gap-1">
        <InputGroupButton size="icon-sm" aria-label="Add attachment">
          <IconPlaceholder
            lucide="Plus"
            tabler="IconPlus"
            hugeicons="PlusSignIcon"
            phosphor="PlusIcon"
            remixicon="RiAddLine"
          />
        </InputGroupButton>
        <InputGroupButton size="sm" className="text-muted-foreground">
          Auto
          <IconPlaceholder
            lucide="ChevronDown"
            tabler="IconChevronDown"
            hugeicons="ArrowDown01Icon"
            phosphor="CaretDownIcon"
            remixicon="RiArrowDownSLine"
          />
        </InputGroupButton>
        <InputGroupButton
          variant="default"
          size="icon-sm"
          className="ml-auto"
          aria-label="Send"
        >
          <IconPlaceholder
            lucide="ArrowUp"
            tabler="IconArrowUp"
            hugeicons="ArrowUp02Icon"
            phosphor="ArrowUpIcon"
            remixicon="RiArrowUpLine"
          />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
