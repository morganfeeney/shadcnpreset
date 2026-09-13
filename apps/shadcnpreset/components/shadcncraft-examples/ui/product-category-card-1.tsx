import { cn } from "@/lib/utils"

function ProductCategoryCard({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="product-category-card"
      className={cn(
        "relative h-85.5 w-75 overflow-hidden rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function ProductCategoryCardImage({
  className,
  src,
  alt,
  ...props
}: React.ComponentProps<"img">) {
  return (
    <img
      data-slot="product-category-card-image"
      className={cn("absolute inset-0 size-full object-cover", className)}
      src={src}
      alt={alt}
      {...props}
    />
  )
}

function ProductCategoryCardOverlay({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="product-category-card-overlay"
      className={cn(
        "pointer-events-none absolute inset-0 bg-linear-to-b from-transparent from-50% to-black/80",
        className
      )}
      {...props}
    />
  )
}

function ProductCategoryCardContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="product-category-card-content"
      className={cn(
        "absolute inset-0 flex flex-col justify-end p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

type TitleElements = "h2" | "h3" | "h4" | "h5" | "h6"

function ProductCategoryCardTitle<T extends TitleElements = "h3">({
  as,
  className,
  ...props
}: React.ComponentProps<T> & { as?: T }) {
  const Comp = as ?? "h3"

  return (
    <Comp
      data-slot="product-category-card-title"
      className={cn(
        "text-2xl font-medium tracking-tight text-white",
        className
      )}
      {...props}
    />
  )
}

function ProductCategoryCardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="product-category-card-description"
      className={cn("text-sm text-white/90", className)}
      {...props}
    />
  )
}

export {
  ProductCategoryCard,
  ProductCategoryCardContent,
  ProductCategoryCardDescription,
  ProductCategoryCardImage,
  ProductCategoryCardOverlay,
  ProductCategoryCardTitle,
}
