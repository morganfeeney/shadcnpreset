import { PropsWithChildren } from "react"
import { DefaultLayout } from "@/components/default-layout"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"

export default function CardCatalogLayout({ children }: PropsWithChildren) {
  return (
    <DefaultLayout>
      <PageHeader>
        <PageHeaderHeading className="max-w-4xl">
          Card catalog
        </PageHeaderHeading>
        <PageHeaderDescription className="text-muted-foreground">
          Reference layouts for preset and UI cards across the app. New variants
          will be added here as they ship.
        </PageHeaderDescription>
      </PageHeader>
      {children}
    </DefaultLayout>
  )
}
