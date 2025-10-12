"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, Copy, MoreVertical, RefreshCw, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

const orders = [
  {
    id: "7333963",
    service: "2199 - Telegram Like (🔥) Reaction Views [Max 1M] INSTANT",
    link: "https://web.telegram.org/a/#8092633438",
    status: "completed",
    date: "2025-10-04 12:59:21",
  },
  {
    id: "7333962",
    service: "4084 - Telegram Members Channel/Group [ Refill:3 Days ] [ 50K/Days] INSTANT",
    link: "https://web.telegram.org/a/#8092633438",
    status: "canceled",
    date: "2025-10-04 12:59:21",
  },
  {
    id: "7331713",
    service: "2199 - Telegram Like (🔥) Reaction Views [Max 1M] INSTANT",
    link: "https://web.telegram.org/a/#8092633438",
    status: "canceled",
    date: "2025-10-04 01:47:54",
  },
  {
    id: "7331712",
    service: "4084 - Telegram Members Channel/Group [ Refill:3 Days ] [ 50K/Days] INSTANT",
    link: "https://web.telegram.org/a/#8092633438",
    status: "canceled",
    date: "2025-10-04 01:47:53",
  },
]

export function OrdersView() {
  const [searchQuery, setSearchQuery] = useState("")

  const copyOrderId = (id: string) => {
    navigator.clipboard.writeText(id)
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
        <p className="text-slate-400">View and manage your order history</p>
      </div>

      {/* Search and Filter */}
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            <Filter className="w-4 h-4 mr-2" />
            Filter Orders
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-10"
            />
          </div>
        </div>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 hover:border-slate-700 transition-all"
          >
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Order ID and Status */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => copyOrderId(order.id)}
                    className={cn(
                      "px-4 py-2 rounded-lg font-mono font-semibold flex items-center gap-2 transition-all",
                      order.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30",
                    )}
                  >
                    {order.id}
                    <Copy className="w-4 h-4" />
                  </button>
                  <Badge
                    className={cn(
                      "px-3 py-1 font-semibold",
                      order.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border-rose-500/30",
                    )}
                  >
                    {order.status === "completed" ? "Completed" : "Canceled"}
                  </Badge>
                </div>

                {/* Service Details */}
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{order.service}</h3>
                  <a
                    href={order.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 w-fit"
                  >
                    {order.link}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Date */}
                <div className="text-sm text-slate-400">{order.date}</div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    order again
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-900 border-slate-800" align="end">
                      <DropdownMenuItem className="cursor-pointer">View Details</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">Copy Link</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-red-400">Cancel Order</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
