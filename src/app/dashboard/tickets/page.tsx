'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Headphones, Paperclip } from "lucide-react";
import { useAuth } from '@/context/AuthContext'
import { createTicket } from './tickit-api'
import { getMyTickets, Ticket as ApiTicket } from './tickit-api'
import { useEffect } from 'react'


export default function Tickets() {
  const [subject, setSubject] = useState('')
  const [orderApiId, setOrderApiId] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  type DisplayTicket = {
    id: string
    subject: string
    status: string
    createdAt?: string
    raw?: any
  }

  const [apiTickets, setApiTickets] = useState<DisplayTicket[] | null>(null)
  const [rawResponse, setRawResponse] = useState<any | null>(null)

  const { token } = useAuth()
  useEffect(() => {
    let mounted = true

    async function loadTickets() {
      if (!token) return
      setStatusMessage(null)
      setApiTickets(null) // show skeletons while loading
      try {
        const res = await getMyTickets(token)
        if (!mounted) return
        setRawResponse(res)

        const payload = (res as any)

        let ticketsSource: any = []

        if (Array.isArray(payload.tickets)) {
          ticketsSource = payload.tickets
        } else if (Array.isArray(payload.data)) {
          ticketsSource = payload.data
        } else if (Array.isArray(payload.data?.tickets)) {
          ticketsSource = payload.data.tickets
        } else if (Array.isArray(payload)) {
          ticketsSource = payload
        }

        if (ticketsSource.length > 0) {
          const normalized = ticketsSource.map((t: any) => ({
            id: t._id ?? t.id ?? String(t.ticketId ?? t.ticket_id ?? t._id ?? ''),
            subject: t.subject ?? t.title ?? 'No subject',
            status: t.status ?? t.state ?? 'open',
            createdAt: t.createdAt ?? t.created_at ?? t.date,
            raw: t,
          } as DisplayTicket))

          setApiTickets(normalized)
        } else if (payload.success === false) {
          setStatusMessage(payload.message || 'Failed to fetch tickets')
        } else {
          setApiTickets([])
        }
      } catch (err) {
        console.error(err)
        if (!mounted) return
        setStatusMessage('Network error while fetching tickets')
      }
    }

    loadTickets()

    return () => {
      mounted = false
    }
  }, [token])
  async function refreshTickets() {
    if (!token) return
    setStatusMessage(null)
    setApiTickets(null)
    try {
      const res = await getMyTickets(token)
      setRawResponse(res)

      const payload = (res as any)
      let ticketsSource: any = []

      if (Array.isArray(payload.tickets)) {
        ticketsSource = payload.tickets
      } else if (Array.isArray(payload.data)) {
        ticketsSource = payload.data
      } else if (Array.isArray(payload.data?.tickets)) {
        ticketsSource = payload.data.tickets
      } else if (Array.isArray(payload)) {
        ticketsSource = payload
      }

      if (ticketsSource.length > 0) {
        const normalized = ticketsSource.map((t: any) => ({
          id: t._id ?? t.id ?? String(t.ticketId ?? t.ticket_id ?? t._id ?? ''),
          subject: t.subject ?? t.title ?? 'No subject',
          status: t.status ?? t.state ?? 'open',
          createdAt: t.createdAt ?? t.created_at ?? t.date,
          raw: t,
        } as DisplayTicket))

        setApiTickets(normalized)
      } else if (payload.success === false) {
        setStatusMessage(payload.message || 'Failed to fetch tickets')
      } else {
        setApiTickets([])
      }
    } catch (err) {
      console.error(err)
      setStatusMessage('Network error while fetching tickets')
    }
  }

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-7xl mx-auto">
      {/* Header Card */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Headphones className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Tickets</h1>
            <p className="text-muted-foreground">
              Be sure to check out the{" "}
              <a href="#" className="text-primary hover:underline">
                FAQ
              </a>{" "}
              page before opening a support request.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Support Request */}
        <Card className="p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-primary" />
            Create a support request
          </h2>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6">
            <p className="text-sm text-foreground/90">
              Create a support Ticket for order and Payment Related Issue. For Service information plz contact via Whatsapp- +918918692910
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ticket subject" className="w-full dark:bg-input/60 dark:border-gray-700" />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="orderId">Order ID (apiOrderId)</Label>
              <Input id="orderId" value={orderApiId} onChange={(e) => setOrderApiId(e.target.value)} placeholder="Enter API Order ID (e.g. 7399585)" className="w-full dark:bg-input/60 dark:border-gray-700" />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={6}
                placeholder="Describe your issue..."
                className="w-full resize-none dark:bg-input/60 dark:border-gray-700"
              />
            </div>

            {statusMessage && (
              <p className="text-sm text-center text-muted-foreground">{statusMessage}</p>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={async () => {
                setStatusMessage(null)
                if (!token) {
                  setStatusMessage('You must be logged in to submit a ticket')
                  return
                }

                if (!subject || !orderApiId) {
                  setStatusMessage('Please provide subject and Order API ID')
                  return
                }

                setLoading(true)
                try {
                  const res = await createTicket({ subject, message: (document.getElementById('message') as HTMLTextAreaElement)?.value || '', apiOrderId: orderApiId }, token)

                  if (res.success) {
                    setStatusMessage('Ticket submitted successfully')
                    // clear fields
                    setSubject('')
                    setOrderApiId('')
                    if (document.getElementById('message')) (document.getElementById('message') as HTMLTextAreaElement).value = ''
                    // Refresh the ticket list so the new ticket appears without a reload
                    try {
                      await refreshTickets()
                    } catch (err) {
                      // non-fatal: we still succeeded at creating the ticket
                      console.error('refresh after create failed', err)
                    }
                  } else {
                    setStatusMessage(res.message || 'Failed to submit ticket')
                  }
                } catch (err) {
                  console.error(err)
                  setStatusMessage('Network error while submitting ticket')
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit ticket'}
            </Button>
          </div>
        </Card>

        {/* My Support Requests */}
        <Card className="p-2 sm:p-6 h-fit overflow-hidden">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-primary" />
            My support requests
          </h2>
          <div className="space-y-3">
            
            {apiTickets === null ? (
              // simple skeleton list (3 items)
              [1, 2, 3].map((i) => (
                <div
                  key={`skeleton-${i}`}
                  className="p-4 rounded-lg border bg-card animate-pulse"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 rounded bg-primary/20 w-3/4" />
                      <div className="h-3 rounded bg-primary/10 w-1/4" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
    
              (apiTickets.length ? apiTickets : []).map((ticket: any) => {
             
              const t = ticket && 'id' in ticket && 'subject' in ticket
                ? ticket
                : {
                    id: ticket._id ?? ticket.id,
                    subject: ticket.subject ?? ticket.title,
                    status: ticket.status ?? ticket.state ?? 'open',
                    createdAt: ticket.createdAt ?? ticket.date,
                  }

              const statusKey = (t.status || 'open').toLowerCase()
              const statusClass =
                statusKey === 'closed'
                  ? 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800 text-destructive'
                  : statusKey === 'resolved'
                  ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800 text-success'
                  : statusKey === 'in-progress'
                  ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800 text-accent'
                  : 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800 text-warning'

              return (
                <div
                  key={t.id ?? ticket._id ?? ticket.id}
                  className="p-4 rounded-lg border bg-card hover:border-primary/40 transition-all cursor-pointer group overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                        S
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium group-hover:text-primary transition-colors break-words sm:truncate">
                          {t.subject}
                        </p>
                        {/* Status badge */}
                        <span className={`inline-block mt-2 sm:mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusClass}`}>{(t.status || 'open')}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2 sm:mt-0 sm:ml-4 sm:whitespace-nowrap">
                      {t.createdAt}
                    </span>
                  </div>
                </div>
              )
              })
            )}
          </div>

        </Card>
      </div>
    </div>
  );
}
