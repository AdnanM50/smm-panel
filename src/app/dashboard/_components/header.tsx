"use client"

import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "./them-switcher"
import { UserMenu } from "./user-menu"
import { Bell, Menu } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-3 sm:px-6 h-14 sm:h-16 border-b backdrop-blur-md"
      style={{
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--background)",
      }}
    >
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="block lg:hidden h-9 w-9 sm:h-10 sm:w-10"
      >
        <Menu className="h-5 w-5" style={{ color: "var(--dashboard-text-primary)" }} />
      </Button>

      {/* Empty space for alignment */}
      <div className="flex-1" />

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 sm:h-10 sm:w-10"
        >
          <Bell className="h-5 w-5" style={{ color: "var(--dashboard-text-primary)" }} />
          <Badge
            className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] sm:text-xs text-white"
            style={{ backgroundColor: "var(--dashboard-orange)" }}
          >
            3
          </Badge>
        </Button>

        <ThemeSwitcher />
        <UserMenu />
      </div>
    </header>
  )
}
