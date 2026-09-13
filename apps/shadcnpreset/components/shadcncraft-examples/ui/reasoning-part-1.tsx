import type { ReasoningUIPart } from "ai"

import { Bubble, BubbleContent } from "@/components/cn-ui/bubble"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/cn-ui/collapsible"
import { Marker, MarkerContent, MarkerIcon } from "@/components/cn-ui/marker"
import { Spinner } from "@/components/cn-ui/spinner"
import { IconPlaceholder } from "@/components/icon-placeholder"

export function ReasoningPart1({ part }: { part: ReasoningUIPart }) {
  const isStreaming = part.state === "streaming"

  return (
    <Collapsible>
      <Marker
        className="transition-colors hover:text-foreground"
        render={<CollapsibleTrigger />}
      >
        <MarkerIcon>
          {isStreaming ? (
            <Spinner />
          ) : (
            <IconPlaceholder
              lucide="Brain"
              tabler="IconBrain"
              hugeicons="BrainIcon"
              phosphor="BrainIcon"
              remixicon="RiBrainLine"
            />
          )}
        </MarkerIcon>
        <MarkerContent className={isStreaming ? "shimmer" : undefined}>
          {isStreaming ? "Reasoning..." : "Reasoning"}
        </MarkerContent>
        <MarkerIcon>
          <IconPlaceholder
            lucide="ChevronDown"
            tabler="IconChevronDown"
            hugeicons="ArrowDown01Icon"
            phosphor="CaretDownIcon"
            remixicon="RiArrowDownSLine"
            className="transition-transform group-data-open/marker:rotate-180"
          />
        </MarkerIcon>
      </Marker>
      <CollapsibleContent>
        <Bubble variant="muted" className="mt-2">
          <BubbleContent className="whitespace-pre-wrap text-muted-foreground">
            {part.text}
          </BubbleContent>
        </Bubble>
      </CollapsibleContent>
    </Collapsible>
  )
}
