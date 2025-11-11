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
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <AdminHeader />

            <main className="pt-16 p-4 md:p-6 lg:p-8 w-full ">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
