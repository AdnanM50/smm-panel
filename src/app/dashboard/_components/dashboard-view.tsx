"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Wallet,
  TrendingUp,
  CirclePlus,
  Layers,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Percent,
  ListChecks,
  Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardViewProps {
  onNavigate: (view: string) => void
}

const platforms = [
  { id: "all", label: "All", icon: "•••" },
  { id: "telegram", label: "Telegram", icon: "✈️" },
  { id: "twitch", label: "Twitch", icon: "🎮" },
  { id: "discord", label: "Discord", icon: "💬" },
  { id: "soundcloud", label: "SoundCloud", icon: "🎵" },
  { id: "threads", label: "Threads", icon: "🧵" },
  { id: "linkedin", label: "LinkedIn", icon: "💼" },
  { id: "pinterest", label: "Pinterest", icon: "📌" },
  { id: "snapchat", label: "Snapchat", icon: "👻" },
  { id: "reddit", label: "Reddit", icon: "🤖" },
]

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const [activePlatform, setActivePlatform] = useState("all")
  const [platformScroll, setPlatformScroll] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isManualScrolling, setIsManualScrolling] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  // Auto-scroll animation
  useEffect(() => {
    const startAutoScroll = () => {
      if (isHovered || isManualScrolling || !scrollContainerRef.current) return

      const container = scrollContainerRef.current
      const scrollStep = 0.5 // pixels per frame (slower for smoother effect)

      const animate = () => {
        if (isHovered || isManualScrolling) {
          animationRef.current = requestAnimationFrame(animate)
          return
        }

        container.scrollLeft += scrollStep

        // Calculate the width of one set of platforms
        const singleSetWidth = container.scrollWidth / 2
        
        // If we've scrolled past the first set, reset to beginning
        if (container.scrollLeft >= singleSetWidth) {
          container.scrollLeft = 0
        }

        animationRef.current = requestAnimationFrame(animate)
      }

      animate()
    }

    startAutoScroll()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isHovered, isManualScrolling])

  // Reset manual scrolling state after a delay
  useEffect(() => {
    if (isManualScrolling) {
      const timer = setTimeout(() => {
        setIsManualScrolling(false)
      }, 2000) // Resume auto-scroll after 2 seconds
      return () => clearTimeout(timer)
    }
  }, [isManualScrolling])

  const scrollPlatforms = (direction: "left" | "right") => {
    setIsManualScrolling(true)
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      scrollContainerRef.current.scrollBy({ 
        left: direction === "left" ? -scrollAmount : scrollAmount, 
        behavior: "smooth" 
      })
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Current Balance</p>
                <h3 className="text-3xl font-bold text-white">$15.87007</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-rose-500/10 to-rose-600/5 border-rose-500/20 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Spending</p>
                <h3 className="text-3xl font-bold text-white">$249.77993</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-rose-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 backdrop-blur-xl md:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-slate-400 mb-1">
                  Current Level: <span className="text-blue-400 font-semibold">JUNIOR</span>
                </p>
                <p className="text-xs text-slate-500">Next Level: FREQUENT</p>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Benefits →
              </Button>
            </div>
            <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-[5%] bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
            </div>
            <p className="text-xs text-slate-400 mt-2">5% Progress</p>
          </div>
        </Card>
      </div>

      {/* Platform Tabs */}
      <div className="relative mb-8">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-slate-400 hover:text-white hover:bg-slate-800/50"
            onClick={() => scrollPlatforms("left")}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div
            ref={scrollContainerRef}
            id="platform-scroll"
            className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Duplicate platforms for seamless infinite scroll */}
            {[...platforms, ...platforms].map((platform, index) => (
              <button
                key={`${platform.id}-${index}`}
                onClick={() => setActivePlatform(platform.id)}
                className={cn(
                  "shrink-0 px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2",
                  activePlatform === platform.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                    : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800",
                )}
              >
                <span>{platform.icon}</span>
                <span className="whitespace-nowrap">{platform.label}</span>
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-slate-400 hover:text-white hover:bg-slate-800/50"
            onClick={() => scrollPlatforms("right")}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Order Section */}
        <Card className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                <CirclePlus className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Create order</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold shadow-lg shadow-blue-600/30"
                onClick={() => onNavigate("new-order")}
              >
                <CirclePlus className="w-5 h-5 mr-2" />
                New order
              </Button>
              <Button
                variant="outline"
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-white h-12 text-base font-semibold"
                onClick={() => onNavigate("mass-order")}
              >
                <Layers className="w-5 h-5 mr-2" />
                Mass order
              </Button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search services..."
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Category</label>
                <Select>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white h-12">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="youtube">YouTube Adword Views - SKIPPABLE ADS [ PACKAGES ]</SelectItem>
                    <SelectItem value="telegram">Telegram Services</SelectItem>
                    <SelectItem value="instagram">Instagram Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics Sidebar */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
          <div className="p-6">
            <div className="flex gap-2 mb-6">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold">Statistics</Button>
              <Button
                variant="outline"
                className="flex-1 bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-white font-semibold relative"
              >
                Read Before Ordering
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white border-0 w-5 h-5 p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Username</p>
                    <p className="font-semibold text-white">shoaibsanto</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-rose-600/20 flex items-center justify-center">
                    <Percent className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Discount Rate</p>
                    <p className="font-semibold text-white">0%</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ListChecks className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">52</p>
                  <p className="text-xs text-slate-400">Active Orders</p>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">1</p>
                  <p className="text-xs text-slate-400">Unread Tickets</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

