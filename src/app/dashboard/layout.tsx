"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "./_components/sidebar"
import { Header } from "./_components/header"
import { ProtectedRoute } from "@/components/ProtectedRoute"


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} isCollapsed={isCollapsed} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />
          <main className="flex-1 overflow-y-auto pt-16">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
