"use client"

import * as React from "react"

import { Button } from "@/components/cn-ui/button"
import { Card, CardContent, CardFooter } from "@/components/cn-ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/cn-ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/cn-ui/field"
import { Input } from "@/components/cn-ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/cn-ui/select"
import { Textarea } from "@/components/cn-ui/textarea"
import { usePreviewPreset } from "@/components/shadcn-examples/preview-preset"
import { getFontDisplayName } from "@/lib/preset"

export function TypographySpecimen() {
  const { font, fontHeading } = usePreviewPreset()
  const headingLabel =
    fontHeading !== "inherit" && fontHeading !== font
      ? getFontDisplayName(fontHeading)
      : "Inherit"
  const bodyLabel = getFontDisplayName(font)

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
                <Select
                  items={[
                    { label: "General", value: "general" },
                    { label: "Bug Report", value: "bug" },
                    { label: "Feature Request", value: "feature" },
                    { label: "Improvement", value: "improvement" },
                  ]}
                  defaultValue="general"
                >
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
