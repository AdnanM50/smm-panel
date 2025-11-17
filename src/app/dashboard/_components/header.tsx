"use client"

import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "./them-switcher"
import { UserMenu } from "./user-menu"
import { Menu } from "lucide-react"

interface HeaderProps {
  onMenuClick?: () => void
  className?: string
}

export function Header({ onMenuClick, className }: HeaderProps) {
  return (
    <header
      className={
        "sticky top-0 z-40 flex items-center justify-between px-3 sm:px-6 h-14 sm:h-16 border-b backdrop-blur-md " +
        (className ?? "")
      }
      style={{
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--background)",
      }}
    >
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

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeSwitcher />
        <UserMenu />
      </div>
    </header>
  )
}
