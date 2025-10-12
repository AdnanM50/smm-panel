"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Logo, LogoIcon } from "@/components/ui/logo"
import { CirclePlus, LayoutGrid, ShoppingBag, Layers, Wallet, Ticket, Code2, X, CheckCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isCollapsed: boolean
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid, badge: null, href: "/dashboard" },
  { id: "new-order", label: "New order", icon: CirclePlus, badge: null, href: "/dashboard/new-order" },
  { id: "services", label: "Services", icon: LayoutGrid, badge: null, href: "/dashboard/services" },
  { id: "orders", label: "Orders", icon: ShoppingBag, badge: null, href: "/dashboard/orders" },
  { id: "mass-order", label: "Mass order", icon: Layers, badge: null, href: "/dashboard/mass-order" },
  { id: "add-funds", label: "Add funds", icon: Wallet, badge: null, href: "/dashboard/add-funds" },
  { id: "tickets", label: "Tickets", icon: Ticket, badge: 1, href: "/dashboard/tickets" },
  { id: "api", label: "API", icon: Code2, badge: null, href: "/dashboard/api" },
]

export function Sidebar({ isOpen, onToggle, isCollapsed }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50 flex flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:w-20" : "lg:w-64",
          "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800/50">
          <div className={cn("flex items-center mb-6", isCollapsed ? "justify-center" : "justify-between")}>
            {!isCollapsed && (
              <Logo size="md" showText={true} />
            )}
            {isCollapsed && (
              <LogoIcon size="md" />
            )}
            <button
              onClick={onToggle}
              className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/50 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isCollapsed && (
            <Link
              href="/dashboard/account"
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all group"
            >
              <Avatar className="w-10 h-10 border-2 border-blue-500/50">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold">
                  S
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">shoaibsanto</span>
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-xs text-slate-400">JUNIOR</span>
              </div>
            </Link>
          )}
          {isCollapsed && (
            <Link
              href="/dashboard/account"
              className="w-full flex justify-center p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all"
            >
              <Avatar className="w-10 h-10 border-2 border-blue-500/50">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold">
                  S
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle()
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50",
                  isCollapsed && "justify-center px-2",
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full" />
                )}
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-red-500 text-white border-0 px-2 py-0.5 text-xs">{item.badge}</Badge>
                    )}
                  </>
                )}
                {isCollapsed && item.badge && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                    {item.badge}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
