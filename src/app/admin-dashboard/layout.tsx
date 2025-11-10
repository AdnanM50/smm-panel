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

    // If not authenticated, send to landing
    if (!isAuthenticated) {
      router.push('/')
      return
    }

    // If authenticated but not an admin, forward to their dashboard or landing
    if (user?.role !== 'admin') {
      if (user?.role === 'user') router.push('/dashboard')
      else router.push('/')
    }
  }, [isLoading, isAuthenticated, user, router])
  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="min-h-screen flex bg-background text-dashboard-text-primary">
          {/* Sidebar */}
          <AdminSidebar />

          {/* Main column */}
          <div className="flex-1 flex flex-col">
            {/* Fixed full-width header */}
            <AdminHeader />

            {/* 
              IMPORTANT: main must have top padding equal to header height (h-16).
              If you change header height, update the padding-top here (e.g. pt-20).
            */}
            <main className="pt-16 p-4 md:p-6 lg:p-8 w-full min-h-[calc(100vh-64px)]" role="main">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
