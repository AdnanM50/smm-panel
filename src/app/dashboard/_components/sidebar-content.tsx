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
  Code,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigationItems = [
  {
    title: "New order",
    url: "/dashboard",
    icon: CirclePlus,
  },
  {
    title: "Services",
    url: "/dashboard/services",
    icon: Grid3X3,
  },
  {
    title: "Orders",
    url: "/dashboard/orders",
    icon: ClipboardList,
  },
  {
    title: "Mass order",
    url: "/dashboard/mass-order",
    icon: FileStack,
  },
  {
    title: "Add funds",
    url: "/dashboard/add-funds",
    icon: Wallet,
  },
  {
    title: "Tickets",
    url: "/dashboard/tickets",
    icon: Ticket,
    badge: "1",
  },
  // {
  //   title: "API",
  //   url: "/dashboard/api",
  //   icon: Code,
  // },
]

interface SidebarContentProps {
  onClose?: () => void
}

export function SidebarContent({ onClose }: SidebarContentProps) {
  const pathname = usePathname()

  return (
    <aside className="w-full h-full flex flex-col" style={{ backgroundColor: 'var(--dashboard-bg-sidebar)', borderRight: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-lg" style={{ backgroundColor: 'var(--dashboard-blue)' }}>
              BS
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold" style={{ color: 'var(--dashboard-text-primary)' }}>BEST SMM</span>
              <span className="text-sm" style={{ color: 'var(--dashboard-text-secondary)' }}>SMM Panel</span>
            </div>
          </div>
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.title}>
              <Link 
                href={item.url} 
                onClick={onClose} // Close sidebar when navigating on mobile
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  pathname === item.url 
                    ? "text-white" 
                    : ""
                }`}
                style={{
                  backgroundColor: pathname === item.url ? 'var(--dashboard-blue)' : 'transparent',
                  color: pathname === item.url ? 'white' : 'var(--dashboard-text-primary)'
                }}
                onMouseEnter={(e) => {
                  if (pathname !== item.url) {
                    e.currentTarget.style.backgroundColor = 'var(--accent)'
                    e.currentTarget.style.color = 'var(--accent-foreground)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== item.url) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--dashboard-text-primary)'
                  }
                }}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
                {item.badge && (
                  <span className="ml-auto text-white text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--dashboard-orange)' }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
