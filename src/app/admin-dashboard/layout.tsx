"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push('/')
      return
    }
    if (user?.role !== 'admin') {
      if (user?.role === 'user') router.push('/dashboard')
      else router.push('/')
    }
  }, [isLoading, isAuthenticated, user, router])
  
  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="min-h-screen flex bg-background text-dashboard-text-primary">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <div className="hidden md:block">
            <AdminSidebar />
          </div>
          
          <div className="flex-1 flex flex-col min-w-0 w-full"> {/* Added min-w-0 and w-full */}
            <AdminHeader />

            {/* Main content with responsive padding */}
            <main className="flex-1 pt-14 sm:pt-16 px-3 sm:px-4 md:px-6 lg:px-8 w-full max-w-full overflow-x-hidden">
              <div className="w-full max-w-full mx-auto"> {/* Container for children */}
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}