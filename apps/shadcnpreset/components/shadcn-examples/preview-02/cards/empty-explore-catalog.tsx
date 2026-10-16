import { Button } from "@/components/cn-ui/button"
import { Card, CardContent } from "@/components/cn-ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/cn-ui/empty"
import { IconPlaceholder } from "@/components/icon-placeholder"

export function EmptyExploreCatalog() {
  return (
    <Card>
      <CardContent>
        <Empty className="p-4">
          <EmptyMedia variant="icon">
            <IconPlaceholder
              lucide="AudioLinesIcon"
              tabler="IconPlayerRecordFilled"
              hugeicons="AudioWave01Icon"
              phosphor="RecordIcon"
              remixicon="RiRecordCircleLine"
            />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Explore Catalog</EmptyTitle>
            <EmptyDescription>
              Check your ISRC codes, metadata, and visual assets before going
              live.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>View Catalog</Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  )
}
