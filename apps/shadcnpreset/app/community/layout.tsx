import { PropsWithChildren } from "react"
import { DefaultLayout } from "@/components/default-layout"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"

export default function Layout({ children }: PropsWithChildren) {
  return (
    <DefaultLayout>
      <PageHeader>
        <PageHeaderHeading className="max-w-4xl">
          Community presets
        </PageHeaderHeading>
        <PageHeaderDescription className="text-muted-foreground">
          Explore presets voted for by the community. Find inspiration, remix
          presets, and share your own.
        </PageHeaderDescription>
      </PageHeader>
      {children}
    </DefaultLayout>
  )
}
