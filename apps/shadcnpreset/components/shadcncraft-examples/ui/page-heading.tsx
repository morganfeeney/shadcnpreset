import { cn } from "@/lib/utils"
import { Tagline } from "@/components/shadcncraft-examples/ui/tagline"

function PageHeading({
  alignment = "left",
  className,
  ...props
}: React.ComponentProps<"div"> & { alignment?: "left" | "center" }) {
  return (
    <div
      data-slot="page-heading"
      className={cn(
        "group/page-heading flex max-w-3xl flex-col gap-3",
        alignment === "left" && "items-start text-left",
        alignment === "center" && "mx-auto items-center text-center",
        className
      )}
      {...props}
    />
  )
}

function PageHeadingTagline({
  ...props
}: React.ComponentProps<typeof Tagline>) {
  return <Tagline variant="badge" {...props} />
}

function PageHeadingTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="page-heading-title"
      className={cn(
        "cn-font-heading scroll-m-20 text-5xl font-medium tracking-tight text-balance lg:text-6xl",
        className
      )}
      {...props}
    />
  )
}

function PageHeadingBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-heading-body"
      className={cn(
        "max-w-xl text-lg text-pretty text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function PageHeadingActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-heading-actions"
      className={cn(
        "flex w-full flex-col gap-1.5 sm:w-fit sm:flex-row",
        className
      )}
      {...props}
    />
  )
}

export {
  PageHeading,
  PageHeadingActions,
  PageHeadingBody,
  PageHeadingTagline,
  PageHeadingTitle,
}
