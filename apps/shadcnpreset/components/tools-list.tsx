"use client"

import Link from "next/link"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"

type ToolListItem = {
  href: string
  title: string
  description: string
}

export function ToolsList({ tools }: { tools: readonly ToolListItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tools.map((tool) => (
        <Card key={tool.href}>
          <CardHeader>
            <CardTitle>{tool.title}</CardTitle>
            <CardDescription>{tool.description}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              href={tool.href}
              className={buttonVariants({ variant: "outline" })}
            >
              Open tool
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
