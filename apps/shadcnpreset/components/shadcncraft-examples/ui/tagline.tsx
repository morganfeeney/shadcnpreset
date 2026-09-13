import type * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const taglineVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 font-medium whitespace-nowrap [&_svg]:shrink-0 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "text-base text-primary",
        primary:
          "rounded-4xl bg-primary px-2 py-0.5 text-xs text-primary-foreground [a&]:hover:bg-primary/80",
        secondary:
          "rounded-4xl bg-secondary px-2 py-0.5 text-xs text-secondary-foreground [a&]:hover:bg-secondary/80",
        badge:
          "rounded-4xl border border-border bg-background px-2 py-0.5 text-xs [a&]:hover:bg-muted [a&]:hover:text-muted-foreground",
        outline:
          "rounded-4xl border border-border bg-transparent px-2 py-0.5 text-xs [a&]:hover:bg-muted [a&]:hover:text-muted-foreground",
        ghost:
          "bg-transparent text-xs text-muted-foreground hover:bg-muted hover:text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Tagline({
  className,
  variant,
  render,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof taglineVariants> & {
    render?: useRender.RenderProp
  }) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        "data-slot": "tagline",
        "data-variant": variant,
        className: cn(taglineVariants({ variant }), className),
      } as React.ComponentProps<"div">,
      props as React.ComponentProps<"div">
    ),
  })
}

export { Tagline, taglineVariants }
