"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { FeaturedIcon } from "@/components/shadcncraft-examples/ui/featured-icon"

type FeatureStackSize = "sm" | "md" | "lg"

const FeatureStackSizeContext = React.createContext<FeatureStackSize>("md")

function FeatureStack({
  size = "md",
  alignment = "center",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  size?: FeatureStackSize
  alignment?: "left" | "center"
}) {
  return (
    <FeatureStackSizeContext.Provider value={size}>
      <div
        data-slot="feature-stack"
        data-size={size}
        data-alignment={alignment}
        className={cn(
          "group/feature-stack flex max-w-xl flex-col justify-start gap-3 [&_svg]:shrink-0",
          "data-[size=lg]:max-w-3xl",
          "data-[alignment=center]:items-center data-[alignment=center]:text-center",
          "data-[alignment=left]:items-start data-[alignment=left]:text-left",
          className
        )}
        {...props}
      />
    </FeatureStackSizeContext.Provider>
  )
}

function FeatureStackMedia({
  className,
  children,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "featured"
}) {
  const stackSize = React.useContext(FeatureStackSizeContext)

  if (variant === "featured") {
    const featuredIconSize: "md" | "lg" = stackSize === "sm" ? "md" : "lg"

    return (
      <div
        data-variant={variant}
        data-slot="feature-stack-media"
        className={cn(
          "group/feature-stack-media shrink-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='text-'])]:text-primary",
          className
        )}
        {...props}
      >
        <FeaturedIcon size={featuredIconSize}>{children}</FeaturedIcon>
      </div>
    )
  }

  return (
    <div
      data-variant={variant}
      data-slot="feature-stack-media"
      className={cn(
        "shrink-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='text-'])]:text-primary",
        "group-data-[size=sm]/feature-stack:[&_svg:not([class*='size-'])]:size-6",
        "group-data-[size=md]/feature-stack:[&_svg:not([class*='size-'])]:size-7",
        "group-data-[size=lg]/feature-stack:[&_svg:not([class*='size-'])]:size-9",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function FeatureStackHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="feature-stack-header"
      className={cn(
        "flex flex-col gap-1 group-data-[size=lg]/feature-stack:gap-3",
        className
      )}
      {...props}
    />
  )
}

function FeatureStackTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="feature-stack-title"
      className={cn(
        "cn-font-heading text-xl font-medium tracking-tight text-balance group-data-[size=lg]/feature-stack:text-3xl group-data-[size=sm]/feature-stack:text-base",
        className
      )}
      {...props}
    />
  )
}

function FeatureStackDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="feature-stack-description"
      className={cn(
        "text-lg text-pretty text-muted-foreground group-data-[size=lg]/feature-stack:text-lg group-data-[size=sm]/feature-stack:text-sm",
        className
      )}
      {...props}
    />
  )
}

function FeatureStackContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="feature-stack-content"
      className={cn("group/feature-stack-content", className)}
      {...props}
    />
  )
}

function FeatureStackFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="feature-stack-footer"
      className={cn("group/feature-stack-footer", className)}
      {...props}
    />
  )
}

export {
  FeatureStack,
  FeatureStackContent,
  FeatureStackDescription,
  FeatureStackFooter,
  FeatureStackHeader,
  FeatureStackMedia,
  FeatureStackTitle,
}
