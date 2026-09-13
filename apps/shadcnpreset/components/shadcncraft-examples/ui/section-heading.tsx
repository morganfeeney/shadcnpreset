import * as React from "react"

import { cn } from "@/lib/utils"
import { Tagline } from "@/components/shadcncraft-examples/ui/tagline"

function SectionHeading({
  alignment = "left",
  size = "lg",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  alignment?: "left" | "center"
  size?: "sm" | "lg"
}) {
  return (
    <div
      data-slot="section-heading"
      data-alignment={alignment}
      data-size={size}
      className={cn(
        "group/section-heading flex max-w-3xl flex-col gap-2.5",
        alignment === "left" && "items-start text-left",
        alignment === "center" && "mx-auto items-center text-center",
        className
      )}
      {...props}
    />
  )
}

function SectionHeadingTagline({
  ...props
}: React.ComponentProps<typeof Tagline>) {
  return <Tagline variant="default" {...props} />
}

type HeadingTypes = "h2" | "h3" | "h4" | "h5" | "h6"
type HeadingProps<T extends HeadingTypes> = React.ComponentProps<T> & {
  as?: T
}

function SectionHeadingTitle<T extends HeadingTypes = "h2">({
  as,
  className,
  ...props
}: HeadingProps<T>) {
  const Comp = as ?? "h2"

  return (
    <Comp
      data-slot="section-heading-title"
      className={cn(
        "cn-font-heading scroll-m-20 text-4xl font-medium tracking-tight text-balance group-data-[size=sm]/section-heading:text-3xl lg:text-5xl lg:group-data-[size=sm]/section-heading:text-4xl",
        className
      )}
      {...props}
    />
  )
}

function SectionHeadingBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="section-heading-body"
      className={cn(
        "max-w-2xl text-base text-pretty text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function SectionHeadingActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="section-heading-actions"
      className={cn(
        "flex w-full flex-col gap-1.5 sm:w-fit sm:flex-row",
        className
      )}
      {...props}
    />
  )
}

export {
  SectionHeading,
  SectionHeadingActions,
  SectionHeadingBody,
  SectionHeadingTagline,
  SectionHeadingTitle,
}
