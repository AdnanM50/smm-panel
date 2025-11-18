"use client";

import React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Users,
  List as ListIcon,
  LifeBuoy,
  X,
  Refrigerator
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";


export default function AdminSidebar() {
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const menu = [
    { href: "/admin-dashboard", label: "Dashboard", Icon: Home },
    { href: "/admin-dashboard/users", label: "Users", Icon: Users },
    { href: "/admin-dashboard/admin-orders", label: "Orders", Icon: ListIcon },
    {
      href: "/admin-dashboard/refill", label: "Refill Requests", Icon: Refrigerator
    },
    { href: "/admin-dashboard/tickets", label: "Support", Icon: LifeBuoy },
  ];
  return (
    <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
      

      <SidebarContent>
        <div className="relative h-full">
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => toggleSidebar()}
            className="absolute top-2 right-2 z-30 inline-flex items-center justify-center rounded-md p-1 text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </button>

          <nav aria-label="Admin navigation" className="px-2 mt-5 md:mt-20 py-2">
          <SidebarMenu>
            {(user?.role === "agent" ? menu.slice(-3) : menu).map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild>
                  <Link href={item.href} className="flex items-center gap-2 w-full">
                    <item.Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </nav>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-3">
          <div className="mt-2">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
