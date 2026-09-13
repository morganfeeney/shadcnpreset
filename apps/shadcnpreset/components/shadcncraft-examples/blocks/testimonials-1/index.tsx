import {
  ProfileCard,
  ProfileCardAvatar,
  ProfileCardDetails,
} from "@/components/shadcncraft-examples/ui/profile-card"

interface Testimonials1Props {
  quote?: string
  name?: string
  title?: string
  date?: string
  imageSrc?: string
}

export function Testimonials1({
  quote = "Acme Inc. has completely streamlined the way I work. I can move between projects without losing momentum, and decisions are clearer and faster than ever.",
  name = "Alex Morgan",
  title = "Product Manager",
  date = "June 2025",
  imageSrc = "https://assets.shadcncraft.com/registry/avatars/person-2.webp",
}: Testimonials1Props) {
  return (
    <section className="py-5 lg:py-16">
      <div className="mx-auto max-w-5xl px-4 lg:px-6">
        {/* Testimonial Quote */}
        <div className="flex w-full flex-col">
          <div className="text-2xl font-medium text-muted-foreground lg:text-4xl">
            “
          </div>
          <blockquote className="text-2xl tracking-tight lg:text-4xl">
            {quote.trim()}
          </blockquote>
          <div className="self-end text-2xl font-medium text-muted-foreground lg:text-4xl">
            ”
          </div>
        </div>

        {/* Testimonial Profile Card */}
        <ProfileCard>
          <ProfileCardAvatar src={imageSrc} name={name} className="size-12" />
          <ProfileCardDetails name={`${name}, ${title}`} body={date} />
        </ProfileCard>
      </div>
    </section>
  )
}
