"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Ticket, Plus, MessageSquare } from "lucide-react"

const tickets = [
  {
    id: "#12345",
    subject: "Order not completed",
    status: "open",
    date: "2025-10-04",
    replies: 3,
  },
]

export function TicketsView() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Support Tickets</h1>
          <p className="text-slate-400">Manage your support requests</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card
            key={ticket.id}
            className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 hover:border-slate-700 transition-all"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                    <Ticket className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{ticket.subject}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <span>{ticket.id}</span>
                      <span>•</span>
                      <span>{ticket.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {ticket.replies} replies
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{ticket.status}</Badge>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">View</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
