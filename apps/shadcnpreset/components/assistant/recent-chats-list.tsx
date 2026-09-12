"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Loader2, X } from "lucide-react"

import { useAssistantChatContext } from "@/components/assistant/assistant-chat-context"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  assistantChatIdFromPath,
  assistantChatPath,
} from "@/lib/assistant-chat-path"
import { cn } from "@/lib/utils"

import type { AssistantChatListItem } from "./use-assistant-chat"

export function RecentChatsList() {
  // The route says which chat is open, so opening one by link or by
  // back/forward highlights the same row a click here does.
  const routeChatId = assistantChatIdFromPath(usePathname())
  const {
    activeChatId,
    activeChatQuery,
    deleteChat,
    deletingChatId,
    isLoadingRecentChats,
    pending,
    recentChats,
  } = useAssistantChatContext()

  return (
    <SidebarMenu>
      {isLoadingRecentChats ? (
        <RecentChatsSkeleton />
      ) : recentChats.length > 0 ? (
        recentChats.map((chat) => (
          <RecentChatRow
            key={chat.id}
            chat={chat}
            isActive={routeChatId === chat.id}
            isActiveChatFetching={
              activeChatId === chat.id && activeChatQuery.isFetching
            }
            pending={pending}
            isDeleting={deletingChatId === chat.id}
            onDeleteChat={(chatId) => void deleteChat(chatId)}
          />
        ))
      ) : null}
    </SidebarMenu>
  )
}

function RecentChatsSkeleton() {
  return Array.from({ length: 4 }).map((_, index) => (
    <SidebarMenuItem key={`chat-skeleton-${index}`}>
      <SidebarMenuButton disabled>
        <Skeleton className="h-4 w-full max-w-[150px]" />
      </SidebarMenuButton>
    </SidebarMenuItem>
  ))
}

function RecentChatRow({
  chat,
  isActive,
  isActiveChatFetching,
  pending,
  isDeleting,
  onDeleteChat,
}: {
  chat: AssistantChatListItem
  isActive: boolean
  isActiveChatFetching: boolean
  pending: boolean
  isDeleting: boolean
  onDeleteChat: (chatId: string) => void
}) {
  return (
    <RecentChatItem>
      <RecentChatTrigger
        title={chat.title}
        href={assistantChatPath(chat.id)}
        isActive={isActive}
        disabled={pending || isDeleting || (isActive && isActiveChatFetching)}
      />
      <RecentChatDeleteButton
        title={chat.title}
        isDeleting={isDeleting}
        disabled={pending || isDeleting}
        onClick={() => onDeleteChat(chat.id)}
      />
    </RecentChatItem>
  )
}

function RecentChatItem({ children }: { children: React.ReactNode }) {
  return (
    <SidebarMenuItem>
      <div className="group relative">{children}</div>
    </SidebarMenuItem>
  )
}

/**
 * A link, so a chat opens in a new tab or copies like any other address.
 * `aria-disabled` because an anchor has nothing to disable: a send in flight
 * belongs to the chat on screen, so following a link mid-send is refused.
 */
function RecentChatTrigger({
  title,
  href,
  isActive,
  disabled,
}: {
  title: string
  href: string
  isActive: boolean
  disabled: boolean
}) {
  return (
    <SidebarMenuButton
      render={<Link href={href} />}
      isActive={isActive}
      onClick={(event: React.MouseEvent<HTMLElement>) => {
        if (disabled) event.preventDefault()
      }}
      aria-disabled={disabled || undefined}
      className="w-full min-w-0 pr-8 group-focus-within/menu-item:bg-sidebar-accent group-focus-within/menu-item:text-sidebar-accent-foreground group-hover/menu-item:bg-sidebar-accent group-hover/menu-item:text-sidebar-accent-foreground"
    >
      {/* The title stays put while the chat loads: a skeleton in its place
          disappears into the sidebar-accent row, leaving what looks like an
          empty button. */}
      <span className="truncate">{title}</span>
    </SidebarMenuButton>
  )
}

function RecentChatDeleteButton({
  title,
  isDeleting,
  disabled,
  onClick,
}: {
  title: string
  isDeleting: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <SidebarMenuAction
      type="button"
      showOnHover
      className={cn(isDeleting ? "opacity-100" : undefined)}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Delete chat ${title}`}
    >
      <RecentChatDeleteIcon isDeleting={isDeleting} />
    </SidebarMenuAction>
  )
}

function RecentChatDeleteIcon({ isDeleting }: { isDeleting: boolean }) {
  return (
    <span className="relative block size-3.5">
      <Loader2
        className={cn(
          "absolute inset-0 m-auto size-3.5 shrink-0 animate-spin",
          isDeleting ? "opacity-100" : "opacity-0"
        )}
      />
      <X
        className={cn(
          "absolute inset-0 m-auto size-3.5 shrink-0",
          isDeleting ? "opacity-0" : "opacity-100"
        )}
      />
    </span>
  )
}
