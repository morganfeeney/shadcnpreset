import type { DynamicToolUIPart, ToolUIPart } from "ai"

import { Marker, MarkerContent, MarkerIcon } from "@/components/cn-ui/marker"
import { Spinner } from "@/components/cn-ui/spinner"
import { IconPlaceholder } from "@/components/icon-placeholder"

/**
 * The line saying a search happened. What it found is rendered once under the
 * answer instead, next to any citation the model produced itself, so a reader
 * has one list rather than one per source of truth.
 */
export function WebSearchPart1({
  part,
}: {
  part: ToolUIPart | DynamicToolUIPart
}) {
  const objective =
    part.input && typeof part.input === "object" && "objective" in part.input
      ? String((part.input as { objective: unknown }).objective)
      : undefined

  if (part.state === "output-error") {
    return (
      <Marker>
        <MarkerIcon>
          <IconPlaceholder
            lucide="TriangleAlert"
            tabler="IconAlertTriangle"
            hugeicons="Alert02Icon"
            phosphor="WarningIcon"
            remixicon="RiAlertLine"
          />
        </MarkerIcon>
        <MarkerContent>Web search failed</MarkerContent>
      </Marker>
    )
  }

  const isRunning =
    part.state === "input-streaming" || part.state === "input-available"

  return (
    <Marker>
      <MarkerIcon>
        {isRunning ? (
          <Spinner />
        ) : (
          <IconPlaceholder
            lucide="Globe"
            tabler="IconGlobe"
            hugeicons="GlobeIcon"
            phosphor="GlobeIcon"
            remixicon="RiGlobeLine"
          />
        )}
      </MarkerIcon>
      <MarkerContent
        className={isRunning ? "shimmer truncate" : "truncate"}
        title={objective}
      >
        {isRunning ? "Searching the web" : "Searched the web"}
        {objective ? ` for ${objective}` : null}
      </MarkerContent>
    </Marker>
  )
}
