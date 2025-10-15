"use client"

import type React from "react"
import { useState } from "react"
import { SidebarContent } from "./_components/sidebar-content"
import { Header } from "./_components/header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--dashboard-bg-main)' }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
