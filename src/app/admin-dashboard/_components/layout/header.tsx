"use client";

import React, { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toster";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";

interface Props {
  className?: string;
}

export default function AdminHeader({ className = "" }: Props) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme") as "light" | "dark" | null;
      if (saved) {
        setTheme(saved);
        applyTheme(saved);
      } else {
        // Respect system preference if nothing saved
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initial = prefersDark ? "dark" : "light";
        setTheme(initial);
        applyTheme(initial);
      }
    } catch (e) {
      // If localStorage blocked, default to dark
      setTheme("dark");
      applyTheme("dark");
    }
  }, []);

  // helper to actually apply theme (adds/removes `dark` class)
  function applyTheme(t: "light" | "dark") {
    const doc = document.documentElement;
    if (t === "dark") {
      doc.classList.add("dark");
    } else {
      doc.classList.remove("dark");
    }
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
    console.log("🚀 ~ toggleTheme ~ e:", e)
    }
    applyTheme(next);
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between gap-4 px-4 border-b bg-background backdrop-blur-sm ${className}`}
      role="banner"
    >
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>

        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">Welcome back</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            className="p-2 rounded-md hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <div className="relative">
           
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded-full focus:outline-none ring-1 ring-ring/0 hover:ring-ring/30 p-1"
                  aria-label="Account menu"
                >
                  <Avatar className="size-8 border border-border">
                    {user?.name ? (
                      <AvatarFallback>{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                    ) : (
                      <AvatarFallback>N</AvatarFallback>
                    )}
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="bottom" className="w-48">
                <div className="px-3 py-2">
                  <DropdownMenuLabel className="flex flex-col gap-0">
                    <span className="text-sm font-medium">{user?.name || "No name"}</span>
                    <span className="text-xs text-muted-foreground">{user?.email || "admin@company.com"}</span>
                  </DropdownMenuLabel>
                </div>
                <DropdownMenuSeparator />

                <div className="px-1 py-1">
                  <DropdownMenuItem asChild>
                    <Link href="/admin-dashboard/account" className="flex items-center gap-2 w-full">
                      <User className="size-4 text-muted-foreground" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator />

                <div className="px-1 py-1">
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      try {
                        logout();
                        toast({
                          title: "Logged out",
                          description: "You have been signed out successfully.",
                        });
                      } catch (err) {
                      console.log("🚀 ~ AdminHeader ~ err:", err)
                      }
                      setTimeout(() => {
                        try {
                          router.push("/login");
                        } catch (err) {}
                      }, 250);
                    }}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="size-4 text-destructive" />
                    <span className="text-destructive">Logout</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
