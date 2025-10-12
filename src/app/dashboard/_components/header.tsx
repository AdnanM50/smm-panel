"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CheckCircle,
  Moon,
  Sun,
  User,
  FileText,
  HelpCircle,
  Code2,
  LogOut,
  ChevronDown,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/theme-provider"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"


interface HeaderProps {
  onToggleSidebar: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function Header({ onToggleSidebar, isCollapsed, onToggleCollapse }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully!')
    // Small delay to show the toast before redirecting
    setTimeout(() => {
      router.push('/login')
    }, 1000)
  }

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-4 md:px-6 transition-all duration-300",
        isCollapsed ? "left-0 lg:left-20" : "left-0 lg:left-64",
      )}
    >
      <div className="flex items-center gap-2">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800/50"
          onClick={onToggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex text-slate-400 hover:text-white hover:bg-slate-800/50"
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-slate-800/50 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
        </button>

        {/* Clock/History icon */}
        <button className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-slate-800/50 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all">
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all group">
              <Avatar className="w-7 h-7 md:w-8 md:h-8 border-2 border-blue-500/50">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold text-xs md:text-sm">
                  {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800" align="end">
            <div className="px-3 py-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{user?.username || user?.name || 'User'}</span>
                <CheckCircle className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-xs text-slate-400">{user?.email}</span>
            </div>
            <DropdownMenuItem onClick={toggleTheme} className="flex items-center gap-2 cursor-pointer">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>Change mode</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/account")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <FileText className="w-4 h-4" />
              <span>Terms of service</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <HelpCircle className="w-4 h-4" />
              <span>FAQ</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/api")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Code2 className="w-4 h-4" />
              <span>API</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 cursor-pointer text-red-400 focus:text-red-400"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
