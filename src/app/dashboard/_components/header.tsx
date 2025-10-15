'use client'

import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "./them-switcher";
import { UserMenu } from "./user-menu";

import { Bell, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden h-10 w-10"
        >
          <Menu className="h-5 w-5" style={{ color: 'var(--dashboard-text-primary)' }} />
        </Button>

        <div className="flex-1" />

        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" className="relative h-10 w-10">
            <Bell className="h-5 w-5" style={{ color: 'var(--dashboard-text-primary)' }} />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-white text-xs font-medium" style={{ backgroundColor: 'var(--dashboard-orange)' }}>
              3
            </Badge>
          </Button>

          <ThemeSwitcher />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
