"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";

import { ThemeProvider } from "@/context/theme-provider";
import AdminSidebar from "./_components/layout/sidebar";
import AdminHeader from "./_components/layout/header";

interface Props {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: Props) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const pathname = usePathname()

  const agentAllowedRoutes = [
    "/admin-dashboard/admin-orders",
    "/admin-dashboard/refill",
    "/admin-dashboard/tickets",
  ]

  const isAgentRouteAllowed = agentAllowedRoutes.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push('/')
      return
    }
    if (user?.role === 'admin') {
      return
    }

    if (user?.role === 'agent') {
      if (!isAgentRouteAllowed) {
        router.replace('/admin-dashboard/admin-orders')
      }
      return
    }

    if (user?.role === 'user') {
      router.push('/dashboard')
    } else {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, user, router, pathname, isAgentRouteAllowed])
  
  return (
    <ThemeProvider>
   <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-background text-dashboard-text-primary w-full">
        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden md:block md:w-auto flex-shrink-0">
          <AdminSidebar />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <AdminHeader />

          {/* Main content with responsive padding */}
          <main className="flex-1 pt-14 sm:pt-16 overflow-x-hidden w-full">
            <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 py-4 sm:py-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
    </ThemeProvider>
  );
}