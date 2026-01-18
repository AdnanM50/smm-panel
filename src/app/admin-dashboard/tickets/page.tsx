"use client"

import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toster"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Eye, MessageSquare, Filter, Download, RefreshCw, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react"

const API_BASE_URL = "https://smm-panel-khan-it.vercel.app/api"

type TicketReply = {
  _id?: string
  sender?: string
  message?: string
  createdAt?: string
}

type Ticket = {
  _id?: string
  id?: string
  userEmail?: string
  orderId?: string
  subject?: string
  message?: string
  status?: string
  createdAt?: string
  updatedAt?: string
  replies?: TicketReply[]
  raw?: any
}

type StatusFilter = "all" | "open" | "closed" | "resolved"

const normalizeTicket = (input: any): Ticket => {
  if (!input || typeof input !== "object") return { replies: [] }

  const ticketIdSource =
    input._id ?? input.id ?? input.ticketId ?? input.ticket_id ?? input.orderId ?? input.apiOrderId ?? null
  const ticketId = ticketIdSource ? String(ticketIdSource) : `ticket-${Date.now()}`

  const replies: TicketReply[] = Array.isArray(input.replies)
    ? input.replies.map((reply: any, index: number) => ({
        _id: String(reply?._id ?? reply?.id ?? `${ticketId}-reply-${index}`),
        sender: reply?.sender ?? reply?.from ?? reply?.author ?? reply?.user ?? "admin",
        message: reply?.message ?? reply?.body ?? "",
        createdAt: reply?.createdAt ?? reply?.created_at ?? reply?.date ?? reply?.timestamp ?? "",
      }))
    : []

  return {
    _id: ticketId,
    id: input.id ? String(input.id) : undefined,
    userEmail: input.userEmail ?? input.email ?? input.user?.email ?? "",
    orderId: String(input.orderId ?? input.apiOrderId ?? input.orderID ?? input.api_order_id ?? ""),
    subject: input.subject ?? input.title ?? "—",
    message: input.message ?? input.body ?? "",
    status: input.status ?? "open",
    createdAt: input.createdAt ?? input.created_at ?? input.date ?? "",
    updatedAt: input.updatedAt ?? input.updated_at ?? "",
    replies,
    raw: input,
  }
}

export default function AdminTicketsPage() {
  const { token, user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[] | null>(null)
  const { toast } = useToast()
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [refreshing, setRefreshing] = useState(false)
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null)
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null)
  const [replyingTicket, setReplyingTicket] = useState<Ticket | null>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [replySubmitting, setReplySubmitting] = useState(false)

  const fetchTickets = async () => {
    if (!token) {
      setError("No auth token available")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/getAllTickets`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      })

      const data = await res.json()

      let source: any[] = []
      if (Array.isArray(data.tickets)) source = data.tickets
      else if (Array.isArray(data.data)) source = data.data
      else if (Array.isArray(data)) source = data
      else if (Array.isArray(data.data?.tickets)) source = data.data.tickets

      if (source.length === 0 && data.success === false) {
        setTickets([])
        setError(data.message || "No tickets found")
      } else {
        const normalized = source.map((t: any) => normalizeTicket(t))
        setTickets(normalized)
      }
    } catch (err: any) {
      console.error("fetch admin tickets error", err)
      setError(err?.message || "Network error")
      setTickets([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [token])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchTickets()
  }

  function formatDate(d?: string) {
    if (!d) return "—"
    try {
      const dt = new Date(d)
      return dt.toLocaleDateString() + " " + dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return d
    }
  }

  const filtered = useMemo(() => {
    if (!tickets) return tickets

    let result = tickets

    if (statusFilter !== "all") {
      result = result.filter((t) => (t.status || "").toLowerCase() === statusFilter.toLowerCase())
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      result = result.filter(
        (t) =>
          String(t._id ?? "")
            .toLowerCase()
            .includes(q) ||
          String(t.userEmail ?? "")
            .toLowerCase()
            .includes(q) ||
          String(t.orderId ?? "")
            .toLowerCase()
            .includes(q) ||
          String(t.subject ?? "")
            .toLowerCase()
            .includes(q) ||
          String(t.message ?? "")
            .toLowerCase()
            .includes(q),
      )
    }

    return result
  }, [tickets, query, statusFilter])

  const getStatusColor = (status = "") => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case "open":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          text: "text-yellow-800 dark:text-yellow-300",
          border: "border-yellow-200 dark:border-yellow-800",
          dot: "bg-yellow-500",
        }
      case "closed":
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          text: "text-red-800 dark:text-red-300",
          border: "border-red-200 dark:border-red-800",
          dot: "bg-red-500",
        }
      case "resolved":
        return {
          bg: "bg-green-50 dark:bg-green-900/20",
          text: "text-green-800 dark:text-green-300",
          border: "border-green-200 dark:border-green-800",
          dot: "bg-green-500",
        }
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-800",
          text: "text-gray-800 dark:text-gray-300",
          border: "border-gray-200 dark:border-gray-700",
          dot: "bg-gray-500",
        }
    }
  }

  const clearFilters = () => {
    setQuery("")
    setStatusFilter("all")
  }

  const toggleTicketExpand = (ticketId: string) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId)
  }

  const startReply = (ticket: Ticket) => {
    setReplyingTicket(ticket)
    setReplyMessage("")
  }

  const openViewTicket = (ticket: Ticket) => {
    setViewingTicket(ticket)
  }

  const closeViewTicket = () => {
    setViewingTicket(null)
  }

  const resetReplyDialog = () => {
    setReplyingTicket(null)
    setReplyMessage("")
  }

  const handleReplySubmit = async () => {
    const ticketId = replyingTicket?._id
    const message = replyMessage.trim()

    if (!ticketId) {
      toast?.({ title: "Reply failed", description: "No ticket selected." })
      return
    }

    if (!token) {
      toast?.({ title: "Not authenticated", description: "No auth token available" })
      return
    }

    if (!message) {
      toast?.({ title: "Message required", description: "Please enter a reply before sending." })
      return
    }

    setReplySubmitting(true)
    let shouldClose = false

    try {
      const response = await fetch(`${API_BASE_URL}/replyToTicket/${ticketId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to send reply")
      }

      const updatedRaw = data?.ticket ?? data?.data ?? null
      const updatedTicket = updatedRaw ? normalizeTicket(updatedRaw) : null

      if (updatedTicket) {
        setTickets((prev) => {
          if (!prev) return [updatedTicket]
          return prev.map((t) => (t._id === updatedTicket._id ? { ...t, ...updatedTicket } : t))
        })
        setViewingTicket((prev) => (prev && prev._id === updatedTicket._id ? { ...prev, ...updatedTicket } : prev))
      } else {
        const fallbackReply: TicketReply = {
          _id: `local-${Date.now()}`,
          sender: user?.role === "admin" ? user?.name ?? "admin" : "admin",
          message,
          createdAt: new Date().toISOString(),
        }

        setTickets((prev) => {
          if (!prev) {
            return [
              {
                ...replyingTicket,
                _id: ticketId,
                replies: [...(replyingTicket?.replies ?? []), fallbackReply],
              } as Ticket,
            ]
          }

          return prev.map((t) =>
            t._id === ticketId ? { ...t, replies: [...(t.replies ?? []), fallbackReply] } : t,
          )
        })
        setViewingTicket((prev) =>
          prev && prev._id === ticketId
            ? { ...prev, replies: [...(prev.replies ?? []), fallbackReply] }
            : prev,
        )
    }

    setExpandedTicket(ticketId)
    toast?.({ title: "Reply sent", description: "Customer will be notified." })
      shouldClose = true
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Failed to send reply"
      toast?.({ title: "Reply failed", description: messageText })
    } finally {
      setReplySubmitting(false)
      if (shouldClose) {
        resetReplyDialog()
      }
    }
  }

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    if (!token) {
      toast?.({ title: "Not authenticated", description: "No auth token available" })
      return
    }

    let prevStatus: string | undefined
    setTickets(
      (prev) =>
        prev?.map((t) => {
          if (t._id === ticketId) {
            prevStatus = t.status
            return { ...t, status: newStatus }
          }
          return t
        }) ?? prev,
    )

    setUpdatingIds((prev) => ({ ...prev, [ticketId]: true }))
    try {
      const res = await fetch(`${API_BASE_URL}/updateTicketStatus/${ticketId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()

      if (res.ok && (data?.status === "Success" || data?.success || data?.message)) {
        toast?.({ title: "Ticket updated", description: `Status changed ${prevStatus || "->"} → ${newStatus}` })
      } else {
        throw new Error(data?.message || "Failed to update ticket")
      }
    } catch (err: any) {
      console.error("updateTicketStatus error", err)
      setTickets((prev) => prev?.map((t) => (t._id === ticketId ? { ...t, status: prevStatus } : t)) ?? prev)
      toast?.({ title: "Update failed", description: String(err?.message || err) })
    } finally {
      setUpdatingIds((prev) => {
        const copy = { ...prev }
        delete copy[ticketId]
        return copy
      })
    }
  }

  const TicketCard = ({ ticket }: { ticket: Ticket }) => {
    const statusColors = getStatusColor(ticket.status)
    const ticketId = ticket._id ?? ""
    const isExpanded = expandedTicket === ticketId

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 mb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs sm:text-sm font-mono text-gray-900 dark:text-white truncate">
                #{ticket._id?.slice(-8)}
              </span>
              {user?.role === "admin" ? (
                <Select value={ticket.status || "open"} onValueChange={(val) => updateTicketStatus(ticketId, val)}>
                  <SelectTrigger
                    className={`text-xs font-medium rounded-full px-2 py-1 border ${statusColors.bg} ${statusColors.text} ${statusColors.border} min-w-[80px]`}
                    disabled={Boolean(updatingIds[ticketId])}
                    size="sm"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">open</SelectItem>
                    <SelectItem value="in-progress">in-progress</SelectItem>
                    <SelectItem value="resolved">resolved</SelectItem>
                    <SelectItem value="closed">closed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                  {ticket.status || "Unknown"}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(ticket.createdAt)}</div>
          </div>
          <button
            onClick={() => toggleTicketExpand(ticketId)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 ml-2"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer</div>
            <div className="text-sm text-gray-900 dark:text-white break-words">{ticket.userEmail || "—"}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Order ID</div>
            <div className="text-sm font-mono text-gray-600 dark:text-gray-400 break-words">
              {ticket.orderId || "—"}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white break-words">{ticket.subject}</div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Message</div>
              <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded p-3 max-h-32 overflow-y-auto">
                {ticket.message || "No message provided"}
              </div>
            </div>

            {ticket.replies && ticket.replies.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">Conversation</div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {ticket.replies?.map((reply) => (
                    <div
                      key={reply._id}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-2.5"
                    >
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-200">{reply.sender || "admin"}</span>
                        <span>{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">
                        {reply.message || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => openViewTicket(ticket)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Eye size={16} />
                View
              </button>
              <button
                type="button"
                onClick={() => startReply(ticket)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MessageSquare size={16} />
                Reply
              </button>
            </div>
          </div>
        )}

        {!isExpanded && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => openViewTicket(ticket)}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Eye size={14} />
              View
            </button>
            <button
              type="button"
              onClick={() => startReply(ticket)}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <MessageSquare size={14} />
              Reply
            </button>
          </div>
        )}
      </div>
    )
  }

  const viewingStatusColors = getStatusColor(viewingTicket?.status || "")

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-3 sm:p-4 lg:p-6">
      <div className="max-w-full">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
                Support Tickets
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-xs sm:text-sm lg:text-base">
                Manage and respond to customer support tickets
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                <span className="hidden xs:inline">Refresh</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                <Download size={16} />
                <span className="hidden xs:inline">Export</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {tickets?.length || 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Tickets</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                {tickets?.filter((t) => t.status?.toLowerCase() === "open").length || 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Open</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-500">
                {tickets?.filter((t) => t.status?.toLowerCase() === "resolved").length || 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Resolved</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-500">
                {tickets?.filter((t) => t.status?.toLowerCase() === "closed").length || 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Closed</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tickets..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
              />
            </div>

            <div className="flex items-center gap-2 sm:w-48">
              <Filter size={16} className="text-gray-400 hidden sm:block" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {(query || statusFilter !== "all") && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-300 dark:border-gray-600 rounded-lg sm:border-none"
              >
                <X size={16} />
                <span className="sm:hidden">Clear</span>
                <span className="hidden sm:inline">Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Showing {filtered?.length || 0} of {tickets?.length || 0} tickets
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <RefreshCw size={18} className="animate-spin" />
                <span className="text-sm sm:text-base">Loading tickets...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 sm:p-6 text-center">
              <div className="text-red-600 dark:text-red-400 text-xs sm:text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
                {error}
              </div>
              <button
                onClick={handleRefresh}
                className="mt-3 sm:mt-4 px-3 sm:px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : tickets && tickets.length === 0 ? (
            <div className="text-center p-6 sm:p-8 lg:p-12">
              <div className="text-gray-400 dark:text-gray-500 text-base sm:text-lg mb-2">No tickets found</div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-4">
                {query || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No support tickets have been created yet"}
              </p>
              {(query || statusFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  className="px-3 sm:px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="block lg:hidden p-3 sm:p-4">
                {filtered?.map((ticket) => (
                  <TicketCard key={ticket._id} ticket={ticket} />
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Ticket ID
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Subject & Message
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filtered?.map((ticket, index) => {
                      const ticketId = ticket._id ?? `ticket-${index}`
                      const statusColors = getStatusColor(ticket.status)
                      return (
                        <tr key={ticketId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-900 dark:text-white">
                              #{ticket._id?.slice(-8)}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white break-words max-w-[150px] sm:max-w-[200px]">
                              {ticket.userEmail || "—"}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
                              {ticket.orderId || "—"}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="max-w-[250px] sm:max-w-[300px]">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {ticket.subject}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                {ticket.message}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            {user?.role === "admin" ? (
                              <Select value={ticket.status || "open"} onValueChange={(val) => updateTicketStatus(ticketId, val)}>
                                <SelectTrigger
                                  className={`text-xs font-medium rounded-full px-2.5 py-1 border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                                  disabled={Boolean(updatingIds[ticketId])}
                                  size="sm"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">open</SelectItem>
                                  <SelectItem value="in-progress">in-progress</SelectItem>
                                  <SelectItem value="resolved">resolved</SelectItem>
                                  <SelectItem value="closed">closed</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                                {ticket.status || "Unknown"}
                              </span>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(ticket.createdAt)}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                title="View Ticket"
                                type="button"
                                onClick={() => openViewTicket(ticket)}
                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                title="Reply"
                                type="button"
                                onClick={() => startReply(ticket)}
                                className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              >
                                <MessageSquare size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog
        open={Boolean(viewingTicket)}
        onOpenChange={(open) => {
          if (!open) {
            closeViewTicket()
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ticket History</DialogTitle>
            <DialogDescription>
              Review the original message and replies for ticket {viewingTicket?._id ? `#${viewingTicket._id.slice(-8)}` : ""}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 text-sm">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Subject
                </span>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {viewingTicket?.subject || "—"}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Customer
                  </span>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white break-words">
                    {viewingTicket?.userEmail || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Order ID
                  </span>
                  <p className="mt-1 text-sm font-mono text-gray-700 dark:text-gray-200 break-all">
                    {viewingTicket?.orderId || "—"}
                  </p>
                </div>
                <div className="sm:col-span-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Created
                  </span>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(viewingTicket?.createdAt)}
                  </p>
                </div>
                <div className="sm:col-span-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </span>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${viewingStatusColors.bg} ${viewingStatusColors.text} ${viewingStatusColors.border}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${viewingStatusColors.dot}`} />
                      {viewingTicket?.status || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Conversation
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {viewingTicket && (
                  <div
                    key={`${viewingTicket._id}-initial`}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-3"
                  >
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {viewingTicket.userEmail || "Customer"}
                      </span>
                      <span>{formatDate(viewingTicket.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">
                      {viewingTicket.message || "No message provided"}
                    </p>
                  </div>
                )}

                {viewingTicket?.replies?.map((reply) => (
                  <div
                    key={reply._id}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-3"
                  >
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{reply.sender || "admin"}</span>
                      <span>{formatDate(reply.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">
                      {reply.message || "—"}
                    </p>
                  </div>
                ))}

                {viewingTicket && (!viewingTicket.replies || viewingTicket.replies.length === 0) && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No replies have been added yet.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" type="button" onClick={closeViewTicket} className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(replyingTicket)}
        onOpenChange={(open) => {
          if (!open && !replySubmitting) {
            resetReplyDialog()
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reply to Ticket</DialogTitle>
            <DialogDescription>
              Send a message to {replyingTicket?.userEmail || "the customer"} about their support request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3 space-y-2">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Subject</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {replyingTicket?.subject || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Customer message</div>
                <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">
                  {replyingTicket?.message || "No message provided"}
                </div>
              </div>
            </div>

            {replyingTicket?.replies && replyingTicket.replies.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">Previous replies</div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {replyingTicket.replies.map((reply) => (
                    <div
                      key={reply._id}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-2.5"
                    >
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-200">{reply.sender || "admin"}</span>
                        <span>{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">
                        {reply.message || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="ticket-reply-message">Reply</Label>
              <Textarea
                id="ticket-reply-message"
                value={replyMessage}
                onChange={(event) => setReplyMessage(event.target.value)}
                placeholder="Write your reply..."
                rows={5}
                disabled={replySubmitting}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                if (replySubmitting) return
                resetReplyDialog()
              }}
              disabled={replySubmitting}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleReplySubmit} disabled={replySubmitting || !replyMessage.trim()}>
              {replySubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
