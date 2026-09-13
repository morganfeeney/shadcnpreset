import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/cn-ui/breadcrumb"
import { Button } from "@/components/cn-ui/button"
import { Input } from "@/components/cn-ui/input"
import { Separator } from "@/components/cn-ui/separator"
import { IconPlaceholder } from "@/components/icon-placeholder"

export function Header1() {
  return (
    <header className="flex flex-col gap-4 p-4 lg:p-7">
      {/* Navigation: Breadcrumbs / Back Button */}
      <div>
        {/* Desktop Breadcrumbs */}
        <Breadcrumb className="max-md:hidden">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">
                <IconPlaceholder
                  lucide="HomeIcon"
                  tabler="IconHome"
                  hugeicons="Home01Icon"
                  phosphor="HouseIcon"
                  remixicon="RiHomeLine"
                  className="size-4"
                />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Acme Inc.</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbEllipsis className="size-5" />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Overview</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Mobile Back Button */}
        <Button variant="link" className="h-5 w-fit px-0! md:hidden">
          <IconPlaceholder
            lucide="ArrowLeft"
            tabler="IconArrowLeft"
            hugeicons="ArrowLeft01Icon"
            phosphor="ArrowLeftIcon"
            remixicon="RiArrowLeftLine"
          />
          Back
        </Button>
      </div>

      {/* Title + Actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end-safe md:justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-balance md:text-2xl">
          Workspace overview
        </h1>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
          <div className="flex shrink-0 flex-col gap-2 max-md:w-full md:flex-row-reverse md:items-center">
            <Button variant="default">Invite member</Button>
            <Button variant="outline">Export</Button>
            <Button variant="ghost" className="max-md:hidden">
              Settings
            </Button>
          </div>
          <Input placeholder="Search..." className="w-full shrink-0 md:w-fit" />
        </div>
      </div>

      <Separator className="max-md:hidden" />
    </header>
  )
}
