"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useAuth } from '@/context/AuthContext'
import { Search, MessageSquare } from 'lucide-react'
// import TicketReplyModal from "./ticket-reply-modal"

const API_BASE_URL = "https://smm-panel-khan-it.up.railway.app/api"

type Ticket = {
  _id?: string
  userEmail?: string
  orderId?: string
  subject?: string
  message?: string
  status?: string
  createdAt?: string
}

export default function AdminTicketsPage() {
  const { token } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    if (!token) return

    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE_URL}/getAllTickets`, {
          headers: {
            "Content-Type": "application/json",
            token
          }
        })

        const data = await res.json()
        const source = data?.tickets || data?.data || data || []
        
        const normalized = source.map((t: any) => ({
          _id: t._id,
          userEmail: t.userEmail,
          orderId: t.orderId,
          subject: t.subject,
          message: t.message,
          status: t.status,
          createdAt: t.createdAt
        }))
        
        setTickets(normalized)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token])

  const filtered = useMemo(() => {
    if (!query.trim()) return tickets
    const q = query.toLowerCase()
    return tickets.filter(t =>
      String(t._id).toLowerCase().includes(q) ||
      String(t.userEmail).toLowerCase().includes(q) ||
      String(t.subject).toLowerCase().includes(q)
    )
  }, [query, tickets])

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets..."
            className="pl-8 pr-3 py-2 w-full border rounded-md bg-input/50 text-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-card border rounded-md overflow-hidden shadow-sm">

        {loading && <div className="p-5 text-sm">Loading...</div>}
        {error && <div className="p-5 text-destructive">{error}</div>}
        {!loading && filtered.length === 0 && (
          <div className="p-5 text-sm text-muted-foreground">No tickets found.</div>
        )}

        {/* Desktop Table */}
        <table className="hidden md:table w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase">
            <tr>
              <th className="p-3 border-b">Email</th>
              <th className="p-3 border-b">Subject</th>
              <th className="p-3 border-b">Status</th>
              <th className="p-3 border-b">Created</th>
              <th className="p-3 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t._id} className="hover:bg-primary/5">
                <td className="p-3 border-b">{t.userEmail}</td>
                <td className="p-3 border-b truncate">{t.subject}</td>
                <td className="p-3 border-b">
                  <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                    t.status === "open" ? "bg-yellow-200 text-yellow-800" :
                    t.status === "closed" ? "bg-red-200 text-red-800" :
                    "bg-green-200 text-green-800"
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="p-3 border-b whitespace-nowrap">
                  {new Date(t.createdAt!).toLocaleString()}
                </td>
                <td className="p-3 border-b text-right">
                  <button
                    onClick={() => setSelected(t)}
                    className="px-3 py-1 border rounded flex gap-2 text-xs hover:bg-primary/5"
                  >
                    <MessageSquare size={14}/> Reply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile List */}
        <div className="md:hidden divide-y">
          {filtered.map(t => (
            <div key={t._id} className="p-3">
              <div className="font-medium">{t.subject}</div>
              <div className="text-xs text-muted-foreground">{t.userEmail}</div>

              <div className="flex justify-between items-center mt-2">
                <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                  t.status === "open" ? "bg-yellow-200 text-yellow-800" :
                  t.status === "closed" ? "bg-red-200 text-red-800" :
                  "bg-green-200 text-green-800"
                }`}>
                  {t.status}
                </span>
                <button
                  onClick={() => setSelected(t)}
                  className="px-2 py-1 border rounded text-xs flex gap-1"
                >
                  <MessageSquare size={14}/> Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <TicketReplyModal
          ticket={selected}
          token={token}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}


 function TicketReplyModal({ ticket, onClose }: any) {
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleReply() {
    setLoading(true)

    await fetch(`https://smm-panel-khan-it.up.railway.app/api/replyTicket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("token") || "",
      },
      body: JSON.stringify({
        ticketId: ticket._id,
        reply,
      })
    })

    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-card p-5 w-full max-w-lg rounded-md shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Reply Ticket</h2>
          <X onClick={onClose} className="cursor-pointer" />
        </div>

        <p className="text-sm text-muted-foreground mb-2">
          <strong>{ticket.userEmail}</strong>
        </p>

        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={5}
          placeholder="Write your reply..."
          className="w-full p-2 border rounded-md text-sm"
        />

        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
          <button
            disabled={loading}
            onClick={handleReply}
            className="px-3 py-2 rounded bg-primary text-white"
          >
            {loading ? "Sending..." : "Send Reply"}
          </button>
        </div>
      </div>
    </div>
  )
}
