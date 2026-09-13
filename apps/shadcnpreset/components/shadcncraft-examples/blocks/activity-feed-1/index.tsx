"use client"

import { useMemo, useState } from "react"

import {
  ActivityFeedItem1,
  type ActivityFeedItemType,
} from "@/components/shadcncraft-examples/ui/activity-feed-item-1"
import { Button } from "@/components/cn-ui/button"
import { ButtonGroup } from "@/components/cn-ui/button-group"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/cn-ui/empty"
import { Input } from "@/components/cn-ui/input"
import { IconPlaceholder } from "@/components/icon-placeholder"

export function ActivityFeed1() {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all")
  const [searchFilter, setSearchFilter] = useState<string>("")

  const filteredByType = useMemo(() => {
    if (selectedTypeFilter === "all") {
      return activityItemsData
    }

    if (selectedTypeFilter === "tasks") {
      return activityItemsData.filter(
        (item) => item.type === "task-completed" || item.type === "file-upload"
      )
    }

    if (selectedTypeFilter === "meetings") {
      return activityItemsData.filter((item) => item.type === "event-scheduled")
    }

    return []
  }, [selectedTypeFilter])

  const filteredItems = useMemo(() => {
    if (searchFilter.trim() === "") {
      return filteredByType
    }

    return filteredByType.filter((item) =>
      item.actor.name.toLowerCase().includes(searchFilter.toLowerCase())
    )
  }, [filteredByType, searchFilter])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(e.target.value)
  }

  const handleResetSearchFilter = () => {
    setSearchFilter("")
  }

  return (
    <section className="flex flex-col gap-5 py-8 lg:gap-8">
      {/* Header and Filters */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-medium tracking-tight">Activity</h2>

        <div className="flex flex-col gap-2.5">
          <Input
            placeholder="Search..."
            className="w-full"
            value={searchFilter}
            onChange={handleSearch}
          />

          <ButtonGroup>
            <Button
              variant={selectedTypeFilter === "all" ? "outline" : "secondary"}
              onClick={() => setSelectedTypeFilter("all")}
              className="border"
            >
              All activities
            </Button>
            <Button
              variant={selectedTypeFilter === "tasks" ? "outline" : "secondary"}
              onClick={() => setSelectedTypeFilter("tasks")}
              className="border"
            >
              <IconPlaceholder
                lucide="FolderOpen"
                tabler="IconFolderOpen"
                hugeicons="FolderOpenIcon"
                phosphor="FolderOpenIcon"
                remixicon="RiFolderOpenLine"
              />{" "}
              Tasks
            </Button>
            <Button
              variant={
                selectedTypeFilter === "meetings" ? "outline" : "secondary"
              }
              onClick={() => setSelectedTypeFilter("meetings")}
              className="border"
            >
              <IconPlaceholder
                lucide="CalendarDays"
                tabler="IconCalendar"
                hugeicons="Calendar01Icon"
                phosphor="CalendarDotsIcon"
                remixicon="RiCalendarLine"
              />{" "}
              Meetings
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {/* Activity Feed Items*/}
      <div className="flex flex-col gap-1">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <ActivityFeedItem1 key={index} {...item} />
          ))
        ) : (
          <Empty>
            <EmptyMedia variant="icon">
              <IconPlaceholder
                lucide="Search"
                tabler="IconSearch"
                hugeicons="SearchIcon"
                phosphor="MagnifyingGlassIcon"
                remixicon="RiSearchLine"
              />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Activity feed is empty</EmptyTitle>
              <EmptyDescription>
                No activities found matching your search, try adjusting your
                filters or reset the search.
              </EmptyDescription>
            </EmptyHeader>

            <Button variant="outline" onClick={handleResetSearchFilter}>
              Reset search
            </Button>
          </Empty>
        )}
      </div>
    </section>
  )
}

const activityItemsData: ActivityFeedItemType[] = [
  {
    type: "file-upload",
    actor: {
      name: "Lucy Aniston",
      avatarSrc:
        "https://assets.shadcncraft.com/registry/avatars/person-5.webp",
    },
    target: { fileName: "Report.pdf", targetName: "Legal folder" },
    timestamp: "10 mins ago",
  },
  {
    type: "task-completed",
    actor: {
      name: "Lucy Aniston",
      avatarSrc:
        "https://assets.shadcncraft.com/registry/avatars/person-5.webp",
    },
    target: { taskName: "Sprint 12" },
    timestamp: "9 mins ago",
  },
  {
    type: "event-scheduled",
    actor: {
      name: "Nathaniel Caldwell",
    },
    target: { eventName: "Team meeting", time: "4:00 PM - 5:00 PM" },
    timestamp: "2 mins ago",
  },
]
