"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { SidebarContent } from "./_components/sidebar-content"
import { Header } from "./_components/header"
import { ThemeProvider } from "@/context/theme-provider"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const mobile = width < 768 // sm breakpoint
      
      setIsMobile(mobile)
      
      // Close sidebar on mobile when resizing
      if (mobile) {
        setSidebarOpen(false)
      }
    }

    // Initial setup
    handleResize()
    
    // Add event listener
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <ThemeProvider>
    <div className="flex h-screen dashboard-layout" style={{ backgroundColor: 'var(--dashboard-bg-main)' }}>
      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - Responsive */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        dashboard-sidebar
      `}>
        <SidebarContent 
          onClose={isMobile ? () => setSidebarOpen(false) : undefined} 
        />
      </div>
      
      {/* Main Content - Responsive */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="dashboard-header">
          <Header 
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
    </ThemeProvider>
  )
}
