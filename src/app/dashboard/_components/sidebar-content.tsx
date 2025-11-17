"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CirclePlus,
  Grid3X3,
  ClipboardList,
  FileStack,
  Wallet,
  Ticket,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigationItems = [
  { title: "New order", url: "/dashboard", icon: CirclePlus },
  { title: "Services", url: "/dashboard/services", icon: Grid3X3 },
  { title: "Orders", url: "/dashboard/orders", icon: ClipboardList },
  { title: "Mass order", url: "/dashboard/mass-order", icon: FileStack },
  { title: "Add funds", url: "/dashboard/add-funds", icon: Wallet },
  { title: "Tickets", url: "/dashboard/tickets", icon: Ticket},
]

interface SidebarContentProps {
  onClose?: () => void
}

export function SidebarContent({ onClose }: SidebarContentProps) {
  const pathname = usePathname()

  return (
    <aside
      className="w-full h-full flex flex-col border-r transition-all duration-300"
      style={{
        backgroundColor: "var(--dashboard-bg-sidebar)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Brand header */}
      <div className="p-[11.5px] flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-lg"
            style={{ backgroundColor: "var(--dashboard-blue)" }}
          >
            BS
          </div>
          <div className="flex flex-col leading-tight">
            <span
              className="text-base sm:text-lg font-bold"
              style={{ color: "var(--dashboard-text-primary)" }}
            >
              BEST SMM
            </span>
           
          </div>
        </div>

        {/* Close button (mobile/tablet only) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 px-3 sm:px-4 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.title}>
              <Link
                href={item.url}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                  pathname === item.url ? "text-white" : ""
                }`}
                style={{
                  backgroundColor:
                    pathname === item.url
                      ? "var(--dashboard-blue)"
                      : "transparent",
                  color:
                    pathname === item.url
                      ? "white"
                      : "var(--dashboard-text-primary)",
                }}
                aria-current={pathname === item.url ? "page" : undefined}
              >
                <item.icon
                  className="h-5 w-5 flex-shrink-0"
                  style={{
                    color:
                      pathname === item.url
                        ? "white"
                        : "var(--dashboard-text-primary)",
                  }}
                />
                <span>{item.title}</span>
              
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
