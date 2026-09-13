import * as React from "react"

import { cn } from "@/lib/utils"

interface AvatarStackProps extends React.ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical"
  max?: number
  avatarSize?: number
  overlapRatio?: number
  mask?: boolean
}

export function AvatarStack({
  children,
  className,
  orientation = "horizontal",
  max, // Max visible avatars before "+N"
  avatarSize, // Avatar size in pixels
  overlapRatio = 0.2, // 20% of avatar size
  mask = true,
  style,
  ...props
}: AvatarStackProps) {
  const items = React.Children.toArray(children)
  const overflow = max ? Math.max(0, items.length - max) : 0
  const visible = items.slice(0, max)

  // Use the first child as the chip wrapper so its size, shape, and styling
  // (Avatar from any registry, plain div, etc.) automatically apply to "+N".
  const firstChild = visible.find(React.isValidElement)

  // `avatarSize` set: force children + chip to that pixel size; derive overlap from it.
  // `avatarSize` omitted: children keep intrinsic size; overlap falls back to 0.5rem.
  // Override the fallback overlap via `style={{ "--overlap": "..." }}` if needed.
  const overlap =
    avatarSize != null ? `${overlapRatio * avatarSize}px` : "0.5rem"

  return (
    <div
      data-slot="avatar-stack"
      data-orientation={orientation}
      className={cn(
        "group isolate flex items-center",
        "data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:-space-x-(--overlap)",
        "data-[orientation=vertical]:flex-col data-[orientation=vertical]:-space-y-(--overlap)",
        "*:shrink-0 *:object-cover *:object-center",
        avatarSize != null && "*:size-(--avatar-size)!",
        mask && "*:ring-2 *:ring-background",
        className
      )}
      style={
        {
          ...style,
          "--overlap": overlap,
          ...(avatarSize != null && { "--avatar-size": `${avatarSize}px` }),
        } as React.CSSProperties
      }
      {...props}
    >
      {visible}
      {overflow > 0 &&
        firstChild &&
        React.cloneElement(
          firstChild as React.ReactElement<Record<string, unknown>>,
          { key: "overflow", "data-slot": "avatar-stack-overflow" },
          <span className="flex size-full items-center justify-center rounded-[inherit] bg-muted text-xs font-medium text-muted-foreground">
            +{overflow}
          </span>
        )}
    </div>
  )
}
