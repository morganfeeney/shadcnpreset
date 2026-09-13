import type { DynamicToolUIPart, ToolUIPart } from "ai"

import {
  CodeSnippet2,
  CodeSnippet2Body,
  CodeSnippet2Code,
  CodeSnippet2Copy,
  CodeSnippet2Filename,
  CodeSnippet2Header,
} from "@/components/shadcncraft-examples/ui/code-snippet-2"
import { cn } from "@/lib/utils"
import { Bubble, BubbleContent } from "@/components/cn-ui/bubble"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/cn-ui/collapsible"
import { Marker, MarkerContent, MarkerIcon } from "@/components/cn-ui/marker"
import { Spinner } from "@/components/cn-ui/spinner"
import { IconPlaceholder } from "@/components/icon-placeholder"

/**
 * Same as `getToolName` from "ai", inlined: importing the package at runtime for
 * this one line bundles its error classes and zod (~70 KB gzipped).
 */
function getToolName(part: ToolUIPart | DynamicToolUIPart) {
  return part.type === "dynamic-tool"
    ? part.toolName
    : part.type.split("-").slice(1).join("-")
}

export function ToolPart1({ part }: { part: ToolUIPart | DynamicToolUIPart }) {
  const isError = part.state === "output-error"
  const isDenied = part.state === "output-denied"
  const isRunning =
    part.state === "input-streaming" || part.state === "input-available"

  const payload = isError
    ? { error: part.errorText }
    : isDenied
      ? { deniedInput: part.input, reason: part.approval?.reason }
      : (part.output ?? part.input)

  const json = JSON.stringify(payload, null, 2)

  return (
    <Collapsible>
      <Marker
        className={cn("transition-colors hover:text-foreground", {
          "text-destructive hover:text-destructive/80": isError,
          "text-warning hover:text-warning/80": isDenied,
        })}
        render={<CollapsibleTrigger />}
      >
        <MarkerIcon>
          {isRunning ? (
            <Spinner />
          ) : isError ? (
            <IconPlaceholder
              lucide="TriangleAlert"
              tabler="IconAlertTriangle"
              hugeicons="Alert02Icon"
              phosphor="WarningIcon"
              remixicon="RiAlertLine"
            />
          ) : isDenied ? (
            <IconPlaceholder
              lucide="ShieldX"
              tabler="IconShieldX"
              hugeicons="UnavailableIcon"
              phosphor="ShieldSlashIcon"
              remixicon="RiProhibitedLine"
            />
          ) : (
            <IconPlaceholder
              lucide="Check"
              tabler="IconCheck"
              hugeicons="Tick02Icon"
              phosphor="CheckIcon"
              remixicon="RiCheckLine"
            />
          )}
        </MarkerIcon>
        <MarkerContent className={isRunning ? "shimmer" : undefined}>
          {part.title ?? getToolName(part)}
          {isError ? " · failed" : isDenied ? " · denied" : null}
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
        <Bubble variant="ghost" className="mt-2">
          <BubbleContent>
            <CodeSnippet2>
              <CodeSnippet2Header>
                <CodeSnippet2Filename>{getToolName(part)}</CodeSnippet2Filename>
                <CodeSnippet2Copy value={json} />
              </CodeSnippet2Header>
              <CodeSnippet2Body>
                <CodeSnippet2Code>{json}</CodeSnippet2Code>
              </CodeSnippet2Body>
            </CodeSnippet2>
          </BubbleContent>
        </Bubble>
      </CollapsibleContent>
    </Collapsible>
  )
}
