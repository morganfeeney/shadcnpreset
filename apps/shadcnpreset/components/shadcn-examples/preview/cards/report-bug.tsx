"use client"

import { Button } from "@/components/cn-ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/cn-ui/card"
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

export function ReportBug() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Bug</CardTitle>
        <CardDescription>Help us fix issues faster.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="bug-title">Title</FieldLabel>
            <Input
              id="bug-title"
              placeholder="Brief description of the issue"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="bug-severity">Severity</FieldLabel>
              <Select
                items={[
                  { label: "Critical", value: "critical" },
                  { label: "High", value: "high" },
                  { label: "Medium", value: "medium" },
                  { label: "Low", value: "low" },
                ]}
                defaultValue="medium"
              >
                <SelectTrigger id="bug-severity" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="bug-component">Component</FieldLabel>
              <Select
                items={[
                  { label: "Dashboard", value: "dashboard" },
                  { label: "Auth", value: "auth" },
                  { label: "API", value: "api" },
                  { label: "Billing", value: "billing" },
                ]}
                defaultValue="dashboard"
              >
                <SelectTrigger id="bug-component" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="auth">Auth</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="bug-steps">Steps to reproduce</FieldLabel>
            <Textarea
              id="bug-steps"
              placeholder="1. Go to&#10;2. Click on&#10;3. Observe..."
              className="min-h-24 resize-none"
            />
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter>
        <Field
          orientation="horizontal"
          className="justify-end style-sera:justify-center"
        >
          <Button variant="outline" className="style-sera:flex-1">
            Attach File
          </Button>
          <Button className="style-sera:flex-1">Submit Bug</Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
