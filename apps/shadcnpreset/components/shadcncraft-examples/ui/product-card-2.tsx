import * as React from "react"

import { cn } from "@/lib/utils"
import { StarRating } from "@/components/shadcncraft-examples/ui/star-rating"

function ProductCard2({
  className,
  alignment = "left",
  ...props
}: React.ComponentProps<"div"> & {
  alignment?: "left" | "center"
}) {
  return (
    <div
      data-slot="product-card"
      data-alignment={alignment}
      className={cn(
        "group/product-card relative flex w-75 flex-col overflow-hidden rounded-lg bg-card",
        "data-[alignment=center]:items-center data-[alignment=left]:items-start",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-1 after:ring-border after:ring-inset",
        className
      )}
      {...props}
    />
  )
}

function ProductCard2Image({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="product-card-image"
      className={cn("relative aspect-7/8 w-full", className)}
      {...props}
    />
  )
}

function ProductCard2ImageBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="product-card-image-badge"
      className={cn("absolute top-2.5 left-2.5 flex", className)}
      {...props}
    />
  )
}

function ProductCard2Body({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="product-card-body"
      className={cn("flex w-full grow flex-col gap-5 p-4", className)}
      {...props}
    />
  )
}

function ProductCard2Content({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="product-card-content"
      className={cn(
        "flex w-full grow flex-col gap-3",
        "group-data-[alignment=left]/product-card:items-start",
        "group-data-[alignment=center]/product-card:items-center",
        className
      )}
      {...props}
    />
  )
}

function ProductCard2StarRating({
  value = 5,
  label,
  className,
  ...props
}: Omit<React.ComponentProps<typeof StarRating>, "size" | "orientation">) {
  return (
    <StarRating
      value={value}
      label={label}
      size="sm"
      orientation="horizontal"
      className={className}
      {...props}
    />
  )
}

function ProductCard2Text({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="product-card-text"
      className={cn(
        "flex w-full flex-col gap-1",
        "group-data-[alignment=left]/product-card:items-start",
        "group-data-[alignment=center]/product-card:items-center",
        className
      )}
      {...props}
    />
  )
}

function ProductCard2Category({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="product-card-category"
      className={cn(
        "text-xs tracking-[0.01em] text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function ProductCard2Header({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="product-card-header"
      className={cn(
        "flex w-full items-center gap-x-1.5",
        "group-data-[alignment=left]/product-card:justify-between",
        "group-data-[alignment=center]/product-card:justify-center",
        className
      )}
      {...props}
    />
  )
}

type TitleElements = "h2" | "h3" | "h4" | "h5" | "h6"

function ProductCard2Title<T extends TitleElements = "h3">({
  as,
  className,
  ...props
}: React.ComponentProps<T> & { as?: T }) {
  const Comp = as ?? "h3"

  return (
    <Comp
      data-slot="product-card-title"
      className={cn(
        "text-balance",
        "group-data-[alignment=left]/product-card:text-lg",
        "group-data-[alignment=center]/product-card:text-base",
        className
      )}
      {...props}
    />
  )
}

function ProductCard2Price({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="product-card-price"
      className={cn(
        "font-medium",
        "group-data-[alignment=left]/product-card:text-lg",
        "group-data-[alignment=center]/product-card:text-base",
        className
      )}
      {...props}
    />
  )
}

function ProductCard2Description({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="product-card-description"
      className={cn(
        "text-pretty text-muted-foreground",
        "group-data-[alignment=center]/product-card:text-center",
        className
      )}
      {...props}
    />
  )
}

function ProductCard2Colors({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="product-card-colors"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

function ProductCard2Color({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="product-card-color"
      className={cn(
        "size-4 shrink-0 rounded-full border-2 border-border",
        className
      )}
      {...props}
    />
  )
}

export {
  ProductCard2,
  ProductCard2Body,
  ProductCard2Category,
  ProductCard2Color,
  ProductCard2Colors,
  ProductCard2Content,
  ProductCard2Description,
  ProductCard2Header,
  ProductCard2Image,
  ProductCard2ImageBadge,
  ProductCard2Price,
  ProductCard2StarRating,
  ProductCard2Text,
  ProductCard2Title,
}
