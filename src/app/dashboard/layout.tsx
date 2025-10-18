"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { SidebarContent } from "./_components/sidebar-content"
import { Header } from "./_components/header"
import { ThemeProvider } from "@/context/theme-provider"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">("desktop")

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) setDeviceType("mobile")
      else if (width < 1024) setDeviceType("tablet")
      else setDeviceType("desktop")
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isMobile = deviceType === "mobile"
  const isTablet = deviceType === "tablet"
  const isDesktop = deviceType === "desktop"

  return (
    <ThemeProvider>
      <div
        className="flex h-screen dashboard-layout overflow-hidden"
        style={{ backgroundColor: "var(--dashboard-bg-main)" }}
      >
        {/* Overlay for mobile/tablet */}
        {sidebarOpen && (isMobile || isTablet) && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            ${isDesktop ? "lg:translate-x-0 lg:static" : ""}`}
        >
          <SidebarContent
            onClose={(isMobile || isTablet) ? () => setSidebarOpen(false) : undefined}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto">
            <div
              className={`
                mx-auto transition-all duration-300
                ${isMobile ? "p-3" : isTablet ? "p-5 max-w-5xl" : "p-6 max-w-7xl"}
              `}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}