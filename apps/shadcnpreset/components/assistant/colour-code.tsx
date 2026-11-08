import type { Components } from "streamdown"

import { isUsableColour } from "@/lib/brand-theme"
import { cn } from "@/lib/utils"

/**
 * Inline code in a reply, as Streamdown draws it; a colour gets a swatch of
 * itself ahead of its value, so "the primary to oklch(0.55 0.16 45)" shows
 * the colour as well as saying it.
 */
// Typed as Streamdown's own, whose React types are a copy of the app's.
export const ColourCode: NonNullable<Components["inlineCode"]> = ({
  className,
  children,
}) => {
  const colour = typeof children === "string" ? children.trim() : null
  const swatch = colour && isUsableColour(colour)
  return (
    <code
      className={cn(
        "rounded bg-muted px-1.5 py-0.5 font-mono text-sm",
        swatch && "whitespace-nowrap",
        className
      )}
      data-streamdown="inline-code"
    >
      {swatch ? (
        <span
          aria-hidden
          className="mr-1.5 inline-block size-3 rounded-sm align-[-0.125em] ring-1 ring-foreground/15 ring-inset"
          style={{ background: colour }}
        />
      ) : null}
      {children}
    </code>
  )
}
