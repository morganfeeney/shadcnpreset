import type { SourceDocumentUIPart, SourceUrlUIPart } from "ai"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/cn-ui/collapsible"
import { Marker, MarkerContent, MarkerIcon } from "@/components/cn-ui/marker"
import { IconPlaceholder } from "@/components/icon-placeholder"

/**
 * Only http(s) URLs reach an `href`, so a `javascript:` or `data:` scheme cannot
 * ride in on a model's citation, a tool result, or a search hit. Returns
 * undefined for anything else, which is the signal to render plain text instead
 * of a link.
 */
function safeHttpUrl(url: string): string | undefined {
  try {
    const { protocol } = new URL(url)
    return protocol === "http:" || protocol === "https:" ? url : undefined
  } catch {
    return undefined
  }
}

export type SourcePart = SourceUrlUIPart | SourceDocumentUIPart

/**
 * One line in the list under an answer, from wherever it came.
 *
 * Two things produce citations and they arrive by different routes. A provider
 * that searches natively emits `source-*` parts into the stream. A
 * provider-executed search tool returns its hits inside its own tool output and
 * emits nothing, so `sendSources` has nothing to forward. Normalising both to
 * this means the reader gets one list rather than a list for one provider and a
 * JSON dump for another.
 */
export type Citation = {
  id: string
  title?: string
  /** Absent on a document with no link, which renders as text. */
  url?: string
  /** Shown beside the title, for a document that names a file. */
  filename?: string
}

export function isSourcePart(part: { type: string }): part is SourcePart {
  return part.type === "source-url" || part.type === "source-document"
}

export function toCitation(part: SourcePart): Citation {
  return part.type === "source-url"
    ? { id: part.sourceId, title: part.title, url: part.url }
    : { id: part.sourceId, title: part.title, filename: part.filename }
}

/** What a gateway search tool returns. Only the fields read here. */
type SearchOutput = {
  results?: { url?: unknown; title?: unknown }[]
}

/**
 * The other route: the hits a completed search tool found.
 *
 * A tool that executes on the gateway returns its results inside its own output
 * rather than emitting `source-*` parts, so nothing reaches the transcript
 * unless it is pulled out here. Easy to miss, because `sendSources` on the route
 * looks like it covers citations, and for a provider's native search it does.
 */
export function webSearchCitations(part: {
  state: string
  toolCallId: string
  output?: unknown
}): Citation[] {
  if (part.state !== "output-available") {
    return []
  }

  const results = (part.output as SearchOutput | undefined)?.results
  if (!Array.isArray(results)) {
    return []
  }

  return results
    .map((result, index) => ({
      id: `${part.toolCallId}-${index}`,
      url: typeof result.url === "string" ? result.url : undefined,
      title: typeof result.title === "string" ? result.title : undefined,
    }))
    .filter((citation) => citation.url)
}

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return undefined
  }
}

/**
 * Several searches in one turn return overlapping hits, so the same page
 * arrives more than once. Keyed on the URL rather than the title, because the
 * same page comes back titled differently depending on the query that found it.
 */
function dedupe(sources: Citation[]) {
  const seen = new Set<string>()

  return sources.filter((source) => {
    const key = source.url ?? source.id
    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

export function SourcesPart1({ sources }: { sources: Citation[] }) {
  const unique = dedupe(sources)

  return (
    <Collapsible>
      <Marker
        className="transition-colors hover:text-foreground"
        render={<CollapsibleTrigger />}
      >
        <MarkerIcon>
          <IconPlaceholder
            lucide="BookOpen"
            tabler="IconBook"
            hugeicons="BookOpen01Icon"
            phosphor="BookOpenIcon"
            remixicon="RiBookOpenLine"
          />
        </MarkerIcon>
        <MarkerContent>
          {unique.length} {unique.length === 1 ? "source" : "sources"}
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
        <div className="mt-2 flex flex-col gap-2">
          {unique.map((source) => {
            // A citation URL is model or tool output, so it is untrusted.
            // Anything that is not http(s) renders as text rather than a link.
            const href = source.url ? safeHttpUrl(source.url) : undefined
            const hostname = href ? hostnameOf(href) : undefined

            const content = (
              <>
                <MarkerIcon>
                  {source.url ? (
                    <IconPlaceholder
                      lucide="Link"
                      tabler="IconLink"
                      hugeicons="Link01Icon"
                      phosphor="LinkIcon"
                      remixicon="RiLink"
                    />
                  ) : (
                    <IconPlaceholder
                      lucide="FileText"
                      tabler="IconFileText"
                      hugeicons="File01Icon"
                      phosphor="FileTextIcon"
                      remixicon="RiFileTextLine"
                    />
                  )}
                </MarkerIcon>
                <MarkerContent className="truncate">
                  {source.title ?? source.url ?? "Source"}
                  {/* Which site it came from, since a list this long is mostly
                      titles that read alike. */}
                  {hostname ? (
                    <span className="ml-1.5 opacity-60">{hostname}</span>
                  ) : null}
                  {source.filename ? (
                    <span className="ml-1 opacity-60">{source.filename}</span>
                  ) : null}
                </MarkerContent>
              </>
            )

            return href ? (
              <Marker
                key={source.id}
                render={
                  <a href={href} target="_blank" rel="noreferrer noopener" />
                }
              >
                {content}
              </Marker>
            ) : (
              <Marker key={source.id}>{content}</Marker>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
