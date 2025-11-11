"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toster'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Search, Eye, MessageSquare, Filter, Download, RefreshCw, X, ChevronDown, ChevronUp } from 'lucide-react'

const API_BASE_URL = "https://smm-panel-khan-it.up.railway.app/api"

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
  [key: string]: any
}

type StatusFilter = 'all' | 'open' | 'closed' | 'resolved'

export default function AdminTicketsPage() {
  const { token, user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[] | null>(null)
  const { toast } = useToast()
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null)

  const fetchTickets = async () => {
    if (!token) {
      setError('No auth token available')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/getAllTickets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          token: token,
        },
      })

      const data = await res.json()

      // Normalize possible responses (matches backend variations)
      let source: any[] = []
      if (Array.isArray(data.tickets)) source = data.tickets
      else if (Array.isArray(data.data)) source = data.data
      else if (Array.isArray(data)) source = data
      else if (Array.isArray(data.data?.tickets)) source = data.data.tickets

      if (source.length === 0 && data.success === false) {
        setTickets([])
        setError(data.message || 'No tickets found')
      } else {
        const normalized = source.map((t: any) => ({
          _id: t._id ?? t.id ?? String(t.ticketId ?? t.ticket_id ?? ''),
          userEmail: t.userEmail ?? t.email ?? t.user?.email ?? '',
          orderId: t.orderId ?? t.apiOrderId ?? t.orderId ?? t.orderID ?? t.orderId,
          subject: t.subject ?? t.title ?? '—',
          message: t.message ?? t.body ?? '',
          status: t.status ?? 'open',
          createdAt: t.createdAt ?? t.created_at ?? t.date ?? '',
          raw: t,
        }))
        setTickets(normalized)
      }
    } catch (err: any) {
      console.error('fetch admin tickets error', err)
      setError(err?.message || 'Network error')
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
    if (!d) return '—'
    try {
      const dt = new Date(d)
      return dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return d
    }
  }

  const filtered = useMemo(() => {
    if (!tickets) return tickets
    
    let result = tickets
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(t => 
        (t.status || '').toLowerCase() === statusFilter.toLowerCase()
      )
    }
    
    // Apply search query
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      result = result.filter(t =>
        String(t._id ?? '').toLowerCase().includes(q) ||
        String(t.userEmail ?? '').toLowerCase().includes(q) ||
        String(t.orderId ?? '').toLowerCase().includes(q) ||
        String(t.subject ?? '').toLowerCase().includes(q) ||
        String(t.message ?? '').toLowerCase().includes(q)
      )
    }
    
    return result
  }, [tickets, query, statusFilter])

  const getStatusColor = (status: string = '') => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case 'open':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          text: 'text-yellow-800 dark:text-yellow-300',
          border: 'border-yellow-200 dark:border-yellow-800',
          dot: 'bg-yellow-500'
        }
      case 'closed':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          text: 'text-red-800 dark:text-red-300',
          border: 'border-red-200 dark:border-red-800',
          dot: 'bg-red-500'
        }
      case 'resolved':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          text: 'text-green-800 dark:text-green-300',
          border: 'border-green-200 dark:border-green-800',
          dot: 'bg-green-500'
        }
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          text: 'text-gray-800 dark:text-gray-300',
          border: 'border-gray-200 dark:border-gray-700',
          dot: 'bg-gray-500'
        }
    }
  }

  const clearFilters = () => {
    setQuery('')
    setStatusFilter('all')
  }

  const toggleTicketExpand = (ticketId: string) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId)
  }

  // Admin: update ticket status API call
  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    if (!token) {
      toast?.({ title: 'Not authenticated', description: 'No auth token available', })
      return
    }
    // Optimistic update: apply immediately in UI, revert on failure
    let prevStatus: string | undefined
    setTickets(prev => prev?.map(t => {
      if (t._id === ticketId) {
        prevStatus = t.status
        return { ...t, status: newStatus }
      }
      return t
    }) ?? prev)

    setUpdatingIds(prev => ({ ...prev, [ticketId]: true }))
    try {
      const res = await fetch(`${API_BASE_URL}/updateTicketStatus/${ticketId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()

      if (res.ok && (data?.status === 'Success' || data?.success || data?.message)) {
        toast?.({ title: 'Ticket updated', description: `Status changed ${prevStatus || '->'} → ${newStatus}` })
      } else {
        throw new Error(data?.message || 'Failed to update ticket')
      }
    } catch (err: any) {
      console.error('updateTicketStatus error', err)
      // revert optimistic update
      setTickets(prev => prev?.map(t => t._id === ticketId ? { ...t, status: prevStatus } : t) ?? prev)
      toast?.({ title: 'Update failed', description: String(err?.message || err) })
    } finally {
      setUpdatingIds(prev => {
        const copy = { ...prev }
        delete copy[ticketId]
        return copy
      })
    }
  }

  // Mobile card view for tickets
  const TicketCard = ({ ticket }: { ticket: Ticket }) => {
    const statusColors = getStatusColor(ticket.status)
    const isExpanded = expandedTicket === ticket._id

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono text-gray-900 dark:text-white">
                #{ticket._id?.slice(-8)}
              </span>
              {user?.role === 'admin' ? (
                <Select
                  value={ticket.status || 'open'}
                  onValueChange={(val) => updateTicketStatus(ticket._id!, val)}
                >
                  <SelectTrigger
                    className={`text-xs font-medium rounded-full px-2 py-1 border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                    disabled={Boolean(updatingIds[ticket._id || ''])}
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
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                  {ticket.status || 'Unknown'}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(ticket.createdAt)}
            </div>
          </div>
          <button
            onClick={() => toggleTicketExpand(ticket._id!)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Basic Info */}
        <div className="space-y-2">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer</div>
            <div className="text-sm text-gray-900 dark:text-white break-words">
              {ticket.userEmail || '—'}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Order ID</div>
            <div className="text-sm font-mono text-gray-600 dark:text-gray-400 break-words">
              {ticket.orderId || '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {ticket.subject}
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Message</div>
              <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded p-3">
                {ticket.message || 'No message provided'}
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <Eye size={16} />
                View
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                <MessageSquare size={16} />
                Reply
              </button>
            </div>
          </div>
        )}

        {/* Collapsed Actions */}
        {!isExpanded && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Eye size={14} />
              View
            </button>
            <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              <MessageSquare size={14} />
              Reply
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-4 lg:p-6 ">
      <div className=" ">
        {/* Header */}
        {/* <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Support Tickets
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm lg:text-base">
                Manage and respond to customer support tickets
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

 
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {tickets?.length || 0}
              </div>
              <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Total Tickets</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-xl lg:text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                {tickets?.filter(t => t.status?.toLowerCase() === 'open').length || 0}
              </div>
              <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Open</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-xl lg:text-2xl font-bold text-green-600 dark:text-green-500">
                {tickets?.filter(t => t.status?.toLowerCase() === 'resolved').length || 0}
              </div>
              <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Resolved</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-xl lg:text-2xl font-bold text-red-600 dark:text-red-500">
                {tickets?.filter(t => t.status?.toLowerCase() === 'closed').length || 0}
              </div>
              <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Closed</div>
            </div>
          </div>
        </div> */}

        {/* Filters and Search */}
        {/* <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
          
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tickets..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
              />
            </div>

        
            <div className="flex items-center gap-2 sm:w-48">
              <Filter size={18} className="text-gray-400 hidden sm:block" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {(query || statusFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-300 dark:border-gray-600 rounded-lg sm:border-none sm:px-3"
              >
                <X size={16} />
                <span className="sm:hidden">Clear</span>
                <span className="hidden sm:inline">Clear Filters</span>
              </button>
            )}
          </div>
        </div> */}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filtered?.length || 0} of {tickets?.length || 0} tickets
          </div>
        </div>

        {/* Tickets List - Mobile Cards & Desktop Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8 lg:p-12">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <RefreshCw size={20} className="animate-spin" />
                <span className="text-sm lg:text-base">Loading tickets...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                {error}
              </div>
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : tickets && tickets.length === 0 ? (
            <div className="text-center p-8 lg:p-12">
              <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">No tickets found</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                {query || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No support tickets have been created yet'
                }
              </p>
              {(query || statusFilter !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="block lg:hidden p-4">
                {filtered?.map((ticket) => (
                  <TicketCard key={ticket._id} ticket={ticket} />
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden lg:block overflow-x-auto w-[800px]">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Ticket ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Subject & Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filtered?.map((ticket) => {
                      const statusColors = getStatusColor(ticket.status)
                      return (
                        <tr 
                          key={ticket._id} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-900 dark:text-white">
                              #{ticket._id?.slice(-8)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white break-words max-w-[200px]">
                              {ticket.userEmail || '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
                              {ticket.orderId || '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-[300px]">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {ticket.subject}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                {ticket.message}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user?.role === 'admin' ? (
                              <Select
                                value={ticket.status || 'open'}
                                onValueChange={(val) => updateTicketStatus(ticket._id!, val)}
                              >
                                <SelectTrigger
                                  className={`text-xs font-medium rounded-full px-2.5 py-1 border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                                  disabled={Boolean(updatingIds[ticket._id || ''])}
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
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                                {ticket.status || 'Unknown'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(ticket.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button 
                                title="View Ticket"
                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                title="Reply"
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
    </div>
  )
}