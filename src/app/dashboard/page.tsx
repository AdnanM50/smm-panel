"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CirclePlus,
  Layers,
  Wallet,
  TrendingUp,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

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

export default function DashboardPage() {
  const { user, fetchProfileDetails } = useAuth()
  const [activePlatform, setActivePlatform] = useState("all")
  const [isHovered, setIsHovered] = useState(false)
  const [isManualScrolling, setIsManualScrolling] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Debug: Log user data
  console.log('Dashboard user data:', user)

  const handleRefreshProfile = async () => {
    try {
      const result = await fetchProfileDetails()
      if (result.success) {
        toast.success('Profile updated successfully!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to refresh profile')
    }
  }

  // Infinite auto-scroll animation
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollSpeed = 0.5 // pixels per frame for smooth movement
    let frame: number

    const animate = () => {
      if (!isHovered && !isManualScrolling) {
        container.scrollLeft += scrollSpeed
        const totalWidth = container.scrollWidth / 2
        if (container.scrollLeft >= totalWidth) {
          container.scrollLeft = 0 // reset scroll for infinite effect
        }
      }
      frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frame)
  }, [isHovered, isManualScrolling])

  // Reset manual scroll after delay
  useEffect(() => {
    if (isManualScrolling) {
      const timer = setTimeout(() => setIsManualScrolling(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isManualScrolling])

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-teal-900/50 to-teal-800/30 backdrop-blur-xl border-teal-700/50 p-6 hover:shadow-xl hover:shadow-teal-500/20 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-teal-300 mb-1">Current Balance</p>
              <h3 className="text-3xl font-bold text-white">${user?.balance?.toFixed(5) || '0.00000'}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-teal-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/30 backdrop-blur-xl border-purple-700/50 p-6 hover:shadow-xl hover:shadow-purple-500/20 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-purple-300 mb-1">Total Spending</p>
              <h3 className="text-3xl font-bold text-white">${user?.totalSpent?.toFixed(5) || '0.00000'}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-indigo-900/30 backdrop-blur-xl border-blue-700/50 p-6 hover:shadow-xl hover:shadow-blue-500/20 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-blue-300 mb-1">
                Current Level: <span className="text-blue-400 font-semibold">JUNIOR</span>
              </p>
              <p className="text-xs text-blue-400 mb-2">Next Level: FREQUENT</p>
              <div className="w-full bg-blue-950/50 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                  style={{ width: "5%" }}
                />
              </div>
              <p className="text-xs text-blue-300">5% Progress</p>
            </div>
            <Link href="/dashboard/account">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Benefits <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Platform Tabs */}
      <div className="relative mb-8">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsManualScrolling(true)
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" })
              }
            }}
            className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            ref={scrollContainerRef}
            id="platform-scroll"
            className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Duplicate for infinite loop */}
            {[...platforms, ...platforms].map((platform, index) => (
              <button
                key={`${platform.id}-${index}`}
                onClick={() => setActivePlatform(platform.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all font-medium",
                  activePlatform === platform.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                    : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800",
                )}
              >
                <span>{platform.icon}</span>
                <span>{platform.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setIsManualScrolling(true)
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" })
              }
            }}
            className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
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
              <Link href="/dashboard/new-order" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold shadow-lg shadow-blue-600/30">
                  <CirclePlus className="w-5 h-5 mr-2" />
                  New order
                </Button>
              </Link>
              <Link href="/dashboard/mass-order" className="block">
                <Button
                  variant="outline"
                  className="w-full bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-white h-12 text-base font-semibold"
                >
                  <Layers className="w-5 h-5 mr-2" />
                  Mass order
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Statistics Panel */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
          <div className="p-6">
            <div className="flex gap-2 mb-6">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                Statistics
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-white font-semibold relative"
              >
                Read Before Ordering
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                    <span className="text-blue-400 font-semibold">👤</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Full Name</p>
                    <p className="text-sm font-semibold text-white">{user?.name || 'Loading...'}</p>
                  </div>
                  <button
                    onClick={handleRefreshProfile}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    title="Refresh profile data"
                  >
                    🔄
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center">
                    <span className="text-green-400 font-semibold">📧</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Email Address</p>
                    <p className="text-xs sm:text-sm font-semibold text-white truncate" title={user?.email || 'Loading...'}>{user?.email || 'Loading...'}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                    <span className="text-red-400 font-semibold">%</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Discount Rate</p>
                    <p className="text-sm font-semibold text-white">0%</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center">
                    <span className="text-green-400 font-semibold">✓</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Active Orders</p>
                    <p className="text-sm font-semibold text-white">52</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                    <span className="text-purple-400 font-semibold">📧</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Unread Tickets</p>
                    <p className="text-sm font-semibold text-white">1</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
