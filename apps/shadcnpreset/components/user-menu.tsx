"use client"

import * as React from "react"
import Link from "next/link"
import { Heart, LogOutIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import type { SessionUser } from "@/stores/auth-store"
import Image from "next/image"

function initialsFor(user: SessionUser) {
  const raw = user.name?.trim() || user.email?.split("@")[0] || ""
  const parts = raw.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  }
  if (raw.length >= 2) return raw.slice(0, 2).toUpperCase()
  if (raw.length === 1) return raw.toUpperCase()
  return "?"
}

function UserAvatar({
  user,
  className,
}: {
  user: SessionUser
  className?: string
}) {
  if (user.image) {
    return (
      <Image
        fill
        src={user.image}
        alt=""
        className={cn("size-full object-cover", className)}
        referrerPolicy="no-referrer"
      />
    )
  }
  const initials = initialsFor(user)
  return (
    <span
      className={cn(
        "flex size-full items-center justify-center bg-muted text-[10px] font-medium text-muted-foreground",
        className
      )}
    >
      {initials}
    </span>
  )
}

type UserMenuProps = {
  /** `icon` matches header icon buttons; `sm` is a compact pill for mobile. */
  variant?: "icon" | "sm"
}

export function UserMenu({ variant = "icon" }: UserMenuProps) {
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)
  const bootstrapSession = useAuthStore((s) => s.bootstrapSession)
  const ensureAuthenticated = useAuthStore((s) => s.ensureAuthenticated)
  const signOut = useAuthStore((s) => s.signOut)

  React.useEffect(() => {
    void bootstrapSession()
  }, [bootstrapSession])

  // if (status === "unknown") {
  //   return <Skeleton className="size-8 shrink-0 rounded-full" />
  // }

  if (status === "anonymous" || !user) {
    return (
      <Button
        size={variant === "sm" ? "sm" : "default"}
        className={variant === "icon" ? "h-8" : undefined}
        onClick={() => {
          void ensureAuthenticated()
        }}
      >
        Sign in
      </Button>
    )
  }

  const label = user.name?.trim() || user.email || "Account"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative size-8 shrink-0 overflow-hidden rounded-full p-0 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Account menu"
          >
            <UserAvatar user={user} />
          </Button>
        }
      />
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="truncate text-sm font-medium">{label}</span>
              {user.email ? (
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              ) : null}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="gap-2"
            nativeButton={false}
            render={<Link href="/my-votes" />}
          >
            <Heart className="size-4" />
            My votes
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            className="gap-2"
            onClick={() => {
              void signOut()
            }}
          >
            <LogOutIcon className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
