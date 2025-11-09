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
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";

/**
 * Theme toggle behavior:
 * - saves "theme" in localStorage as "light" | "dark"
 * - toggles `document.documentElement.classList` adding/removing "dark"
 * - on init it respects localStorage, otherwise system preference
 *
 * If your ThemeProvider already handles theme switching, replace the local logic
 * below with calls to that context instead.
 */

interface Props {
  className?: string;
}

export default function AdminHeader({ className = "" }: Props) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const { user, logout } = useAuth();
  const router = useRouter();

  // Initialize theme on mount
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

  // toggle handler
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      // ignore storage errors
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

          {/* Avatar + dropdown in header */}
          <div className="relative">
            {/* Uncontrolled dropdown: let Radix manage open state so moving
                between trigger and content doesn't unexpectedly close it. */}
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
                      // onSelect fires before the menu closes — use it for logout
                      e.preventDefault();
                      logout();
                      try {
                        router.push("/login");
                      } catch (err) {}
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
