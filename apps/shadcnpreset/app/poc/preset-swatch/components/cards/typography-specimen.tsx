"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FONTS } from "@/app/(create)/lib/fonts"

function fontDisplayName(value: string): string {
  const match = FONTS.find((f) => f.value === value)
  if (match) {
    return match.name
  }
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export type TypographySpecimenCardProps = {
  /** Body / UI font token (e.g. from decoded preset). */
  font: string
  /** Heading font token or `"inherit"`. */
  fontHeading: string
}

/**
 * Port of v4 `registry/bases/radix/blocks/preview/cards/typography-specimen.tsx`,
 * with `font` / `fontHeading` passed in instead of create URL search params.
 */
export function TypographySpecimenCard({
  font,
  fontHeading,
}: TypographySpecimenCardProps) {
  const bodyLabel = fontDisplayName(font)

  const headingLabel = React.useMemo(() => {
    if (fontHeading === "inherit") {
      return "Inherit"
    }
    const headingName = fontDisplayName(fontHeading)
    return headingName !== bodyLabel ? headingName : "Inherit"
  }, [bodyLabel, fontHeading])

  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="text-xs font-medium text-muted-foreground uppercase">
          {headingLabel} - {bodyLabel}
        </div>
        <p className="cn-font-heading text-2xl font-medium style-sera:text-lg style-sera:font-semibold style-sera:tracking-wider style-sera:uppercase">
          Designing with rhythm and hierarchy.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A strong body style keeps long-form content readable and balances the
          visual weight of headings.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Thoughtful spacing and cadence help paragraphs scan quickly without
          feeling dense.
        </p>
      </CardContent>
      <CardFooter>
        <Dialog>
          <DialogTrigger
            render={<Button variant="outline" className="w-full" />}
          >
            Share Feedback
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Feedback</DialogTitle>
              <DialogDescription>
                Let us know how we can improve your experience.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="feedback-name">Name</FieldLabel>
                  <Input id="feedback-name" placeholder="Your name" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="feedback-email">Email</FieldLabel>
                  <Input
                    id="feedback-email"
                    type="email"
                    placeholder="you@example.com"
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="feedback-category">Category</FieldLabel>
                <Select defaultValue="general">
                  <SelectTrigger id="feedback-category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="improvement">Improvement</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="feedback-message">Message</FieldLabel>
                <Textarea
                  id="feedback-message"
                  placeholder="Tell us what's on your mind..."
                  className="min-h-24 resize-none"
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
