import { Avatar, AvatarFallback, AvatarImage } from "@/components/cn-ui/avatar"
import { Button } from "@/components/cn-ui/button"
import { AvatarStack } from "@/components/shadcncraft-examples/ui/avatar-stack"
import {
  SectionHeading,
  SectionHeadingBody,
  SectionHeadingTitle,
} from "@/components/shadcncraft-examples/ui/section-heading"

export function Contact9() {
  return (
    <section className="flex flex-col items-center gap-7 rounded-lg border bg-background px-4 py-7 lg:px-7">
      {/* Avatar Group */}
      <AvatarStack className="grayscale">
        <Avatar>
          <AvatarImage src="https://assets.shadcncraft.com/registry/avatars/cartoon-2.webp" />
          <AvatarFallback>01</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://assets.shadcncraft.com/registry/avatars/cartoon-3.webp" />
          <AvatarFallback>02</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://assets.shadcncraft.com/registry/avatars/cartoon-4.webp" />
          <AvatarFallback>03</AvatarFallback>
        </Avatar>
      </AvatarStack>

      {/* Section Heading */}
      <SectionHeading
        alignment="center"
        size="sm"
        className="mx-auto w-full max-w-xl"
      >
        <SectionHeadingTitle>Want to know more?</SectionHeadingTitle>
        <SectionHeadingBody>
          Our team is here to help you get the answers you need.
        </SectionHeadingBody>
      </SectionHeading>

      {/* CTA Button */}
      <Button className="max-sm:h-10 max-sm:w-full">Get in touch</Button>
    </section>
  )
}
