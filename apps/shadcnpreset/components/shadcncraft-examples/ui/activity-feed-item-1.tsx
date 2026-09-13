"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/cn-ui/avatar"
import { Badge } from "@/components/cn-ui/badge"
import { Separator } from "@/components/cn-ui/separator"
import { IconPlaceholder } from "@/components/icon-placeholder"

// COMPONENT BASE PROPS
type ActivityFeedBaseProps = {
  actor: {
    name: string
    avatarSrc?: string
  }
  action?: string
  timestamp: string
  connector?: boolean
}

// FILE UPLOAD TYPE PROPS
type FileUploadTarget = {
  fileName: string
  targetName: string
}

type FileUploadProps = ActivityFeedBaseProps & {
  type: "file-upload"
  target: FileUploadTarget
}

// TASK COMPLETED TYPE PROPS
type TaskCompletedProps = ActivityFeedBaseProps & {
  type: "task-completed"
  target: TaskCompletedTarget
}

type TaskCompletedTarget = {
  taskName: string
}

// EVENT SCHEDULED TYPE PROPS
type EventScheduledTarget = {
  eventName: string
  time: string
}

type EventScheduledProps = ActivityFeedBaseProps & {
  type: "event-scheduled"
  target: EventScheduledTarget
}

// TARGET UNION TYPE
type TargetUnion = FileUploadTarget | TaskCompletedTarget | EventScheduledTarget

type ActivityConfig = {
  icon: React.ReactNode
  defaultAction: string
  getTargetLabel: (target: TargetUnion) => string
  getBadgeLabel: (target: TargetUnion) => string
}

const ACTIVITY_CONFIG: Record<
  "file-upload" | "task-completed" | "event-scheduled",
  ActivityConfig
> = {
  "file-upload": {
    icon: (
      <IconPlaceholder
        lucide="Paperclip"
        tabler="IconPaperclip"
        hugeicons="AttachmentIcon"
        phosphor="PaperclipIcon"
        remixicon="RiAttachmentLine"
      />
    ),
    defaultAction: "uploaded a file to",
    getTargetLabel: (target) => (target as FileUploadTarget).targetName,
    getBadgeLabel: (target) => (target as FileUploadTarget).fileName,
  },
  "task-completed": {
    icon: (
      <IconPlaceholder
        lucide="CheckCircle2"
        tabler="IconCircleCheck"
        hugeicons="CheckmarkCircle02Icon"
        phosphor="CheckCircleIcon"
        remixicon="RiCheckboxCircleLine"
        className="text-success"
      />
    ),
    defaultAction: "completed",
    getTargetLabel: (target) => (target as TaskCompletedTarget).taskName,
    getBadgeLabel: () => "All tasks completed",
  },
  "event-scheduled": {
    icon: (
      <IconPlaceholder
        lucide="CalendarDays"
        tabler="IconCalendar"
        hugeicons="Calendar01Icon"
        phosphor="CalendarDotsIcon"
        remixicon="RiCalendarLine"
      />
    ),
    defaultAction: "booked a call tomorrow at",
    getTargetLabel: (target) => (target as EventScheduledTarget).time,
    getBadgeLabel: (target) => (target as EventScheduledTarget).eventName,
  },
} as const

// ACTIVITY FEED ITEM PROPS
export type ActivityFeedItemType =
  FileUploadProps | TaskCompletedProps | EventScheduledProps
type ActivityFeedItem1Props = ActivityFeedItemType & React.ComponentProps<"div">

// CONTEXT
type ActivityFeedItemContextValue = {
  type: ActivityFeedItemType["type"]
  actor: ActivityFeedItemType["actor"]
  actionText: ActivityFeedItemType["action"]
  timestamp: ActivityFeedItemType["timestamp"]
  connector: boolean
  badgeIcon: React.ReactNode
  targetText: string
  badgeText: string
}

const ActivityFeedItemContext =
  React.createContext<ActivityFeedItemContextValue | null>(null)

function useActivityFeedItemContext() {
  const context = React.useContext(ActivityFeedItemContext)
  if (!context) {
    throw new Error(
      "useActivityFeedItemContext must be used within an ActivityFeedItem1"
    )
  }
  return context
}

export function ActivityFeedItem1({
  type,
  actor,
  action,
  target,
  timestamp,
  className,
  connector = true,
  ...props
}: ActivityFeedItem1Props) {
  const config = ACTIVITY_CONFIG[type]

  const resolvedActionText = action ?? config.defaultAction
  const resolvedBadgeIcon = config.icon
  const resolvedTargetLabel = config.getTargetLabel(target)
  const resolvedBadgeLabel = config.getBadgeLabel(target)

  const contextValue = React.useMemo<ActivityFeedItemContextValue>(
    () => ({
      type,
      actor,
      timestamp,
      connector,
      badgeIcon: resolvedBadgeIcon,
      actionText: resolvedActionText,
      targetText: resolvedTargetLabel,
      badgeText: resolvedBadgeLabel,
    }),
    [
      type,
      actor,
      timestamp,
      connector,
      resolvedActionText,
      resolvedBadgeIcon,
      resolvedTargetLabel,
      resolvedBadgeLabel,
    ]
  )

  return (
    <ActivityFeedItemContext.Provider value={contextValue}>
      <div
        data-slot="activity-feed-item"
        data-type={type}
        className={cn(
          "group/activity-feed-item relative flex gap-2.5",
          className
        )}
        {...props}
      >
        {/* Avatar and connector */}
        <div className="relative flex shrink-0 flex-col items-center gap-1">
          <ActivityFeedItemAvatar />

          {connector && (
            <Separator
              data-slot="activity-feed-item-connector"
              orientation="vertical"
              className={cn(
                "mx-auto flex-1 group-last/activity-feed-item:hidden"
              )}
            />
          )}
        </div>

        {/* Activity Content and Badge */}
        <div
          data-slot="activity-feed-item-content"
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-1.5 pb-6",
            !connector ? "pb-0" : "group-last/activity-feed-item:pb-0"
          )}
        >
          <ActivityFeedItemActivity />
          <ActivityFeedItemBadge />
        </div>
      </div>
    </ActivityFeedItemContext.Provider>
  )
}

function ActivityFeedItemAvatar() {
  const { actor } = useActivityFeedItemContext()

  const fallbackInitials = React.useMemo(() => {
    const parts = actor.name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return actor.name.slice(0, 2).toUpperCase()
  }, [actor.name])

  return (
    <Avatar className="shrink-0" data-slot="activity-feed-item-avatar">
      <AvatarImage
        src={actor.avatarSrc ?? undefined}
        alt={actor.name}
        className="object-cover"
      />
      <AvatarFallback className="uppercase">{fallbackInitials}</AvatarFallback>
    </Avatar>
  )
}

function ActivityFeedItemActivity() {
  const { actor, actionText, targetText, timestamp } =
    useActivityFeedItemContext()

  return (
    <div
      data-slot="activity-feed-item-activity"
      className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between"
    >
      {/* Actor name and description */}
      <div className="flex flex-col flex-wrap gap-1 md:flex-row md:items-center">
        <span className="font-medium">{actor.name}</span>
        <span className="text-sm text-pretty text-muted-foreground">
          {actionText} <span className="text-foreground">{targetText}</span>
        </span>
      </div>

      {/* Timestamp */}
      <span className="shrink-0 text-xs text-muted-foreground">
        {timestamp}
      </span>
    </div>
  )
}

function ActivityFeedItemBadge() {
  const { badgeIcon, badgeText } = useActivityFeedItemContext()
  return (
    <Badge
      data-slot="activity-feed-item-badge"
      variant="outline"
      className="text-muted-foreground"
    >
      {badgeIcon}
      {badgeText}
    </Badge>
  )
}
