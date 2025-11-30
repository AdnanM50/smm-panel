'use client'
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Headphones, Eye } from "lucide-react";
import { useAuth } from '@/context/AuthContext'
import { createTicket, getMyTickets, replyToTicket } from './tickit-api'
import { useToast } from '@/hooks/use-toster'


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
    replies?: any[]
  }

  const [apiTickets, setApiTickets] = useState<DisplayTicket[] | null>(null)
  const [rawResponse, setRawResponse] = useState<any | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<DisplayTicket | null>(null)
  const [replyDraft, setReplyDraft] = useState<string>('')
  const [isReplying, setIsReplying] = useState(false)

  const { token } = useAuth()
  const { toast } = useToast()
  useEffect(() => {
    let mounted = true

    async function loadTickets() {
      if (!token) return
      setStatusMessage(null)
      setApiTickets(null) 
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
            replies: Array.isArray(t.replies)
              ? t.replies
              : Array.isArray(t.data?.replies)
              ? t.data.replies
              : [],
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
          replies: Array.isArray(t.replies)
            ? t.replies
            : Array.isArray(t.data?.replies)
            ? t.data.replies
            : [],
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

  const getTicketReplies = (ticket: DisplayTicket | null) => {
    if (!ticket) return []
    if (Array.isArray(ticket.replies) && ticket.replies.length > 0) return ticket.replies
    if (Array.isArray(ticket.raw?.replies) && ticket.raw.replies.length > 0) return ticket.raw.replies
    if (Array.isArray(ticket.raw?.data?.replies) && ticket.raw.data.replies.length > 0) return ticket.raw.data.replies
    return []
  }

  const formatReplySender = (reply: any) => {
    const sender = reply?.sender ?? reply?.from ?? reply?.author ?? reply?.user
    if (!sender) return 'Unknown'
    return String(sender)
  }

  const formatReplyDate = (value?: string) => {
    if (!value) return '—'
    try {
      return new Date(value).toLocaleString()
    } catch {
      return value
    }
  }

  const formatTicketDate = (value?: string) => {
    if (!value) return '—'
    try {
      const date = new Date(value)
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
      return date.toLocaleString(undefined, options)
    } catch {
      return value
    }
  }

  const openReplyModal = (ticket: DisplayTicket) => {
    setSelectedTicket(ticket)
    setReplyDraft('')
  }

  const closeReplyModal = () => {
    setSelectedTicket(null)
    setReplyDraft('')
  }

  const handleReplySubmit = async () => {
    if (!selectedTicket) return
    if (!token) {
      setStatusMessage('You must be logged in to reply to a ticket')
      return
    }

    const message = replyDraft.trim()
    if (!message) {
      setStatusMessage('Please enter a reply message')
      return
    }

    setIsReplying(true)
    setStatusMessage(null)

    try {
      const replyResult = await replyToTicket(selectedTicket.id, message, token)

      if (!replyResult.success) {
        throw new Error(replyResult.message || 'Unable to send reply')
      }

      toast({
        title: 'Reply sent',
        description: replyResult.message || 'Your response was recorded',
      })

      await refreshTickets()
      closeReplyModal()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reply'
      setStatusMessage(message)
      toast({
        title: 'Reply failed',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsReplying(false)
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
              <Label htmlFor="orderId">Order ID </Label>
              <Input id="orderId" value={orderApiId} onChange={(e) => setOrderApiId(e.target.value)} placeholder="Enter your Order ID (e.g. 7399585)" className="w-full dark:bg-input/60 dark:border-gray-700" />
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
                    toast({
                      title: 'Ticket submitted',
                      description: res.message || 'We received your request and will follow up soon.',
                    })
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
                    toast({
                      title: 'Ticket submission failed',
                      description: res.message || 'Failed to submit ticket',
                      variant: 'destructive',
                    })
                  }
                } catch (err) {
                  console.error(err)
                  setStatusMessage('Network error while submitting ticket')
                  toast({
                    title: 'Ticket submission failed',
                    description: 'Network error while submitting ticket',
                    variant: 'destructive',
                  })
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
                  ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800 text-white'
                  : 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800 text-warning'

              const ticketReplies = getTicketReplies(t)
              const hasAdminReply = ticketReplies.some((reply:any) => {
                const sender = String(reply?.sender ?? reply?.from ?? reply?.author ?? reply?.user ?? '').toLowerCase()
                return sender === 'admin'
              })

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
                    <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-4 sm:whitespace-nowrap">
                      {hasAdminReply && (
                        <button
                          type="button"
                          className="rounded-full p-1 text-muted-foreground transition-colors hover:text-primary"
                          onClick={() => openReplyModal(t)}
                          aria-label="View admin replies"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="sr-only">View admin replies</span>
                        </button>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTicketDate(t.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )
              })
            )}
          </div>

        </Card>
      </div>
      <Dialog open={Boolean(selectedTicket)} onOpenChange={(open) => !open && closeReplyModal()}>
        <DialogContent className="space-y-4">
          <DialogHeader>
            <DialogTitle>Replies for {selectedTicket?.subject ?? 'ticket'}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {selectedTicket ? `Ticket ID ${selectedTicket.id}` : 'Select a ticket to read replies.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {(() => {
              const replies = getTicketReplies(selectedTicket)
              if (replies.length === 0) {
                return <p className="text-sm text-muted-foreground">No replies yet.</p>
              }
              return replies.map((reply:any, index:any) => (
                <div
                  key={reply?._id ?? reply?.id ?? `${selectedTicket?.id ?? 'reply'}-${index}`}
                  className="rounded-lg border border-border/50 bg-muted/60 p-3"
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span className="font-semibold">{formatReplySender(reply)}</span>
                    <span>{formatReplyDate(reply?.createdAt ?? reply?.created_at ?? reply?.date)}</span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-line">{reply?.message ?? reply?.body ?? ''}</p>
                </div>
              ))
            })()}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reply-message">Write a reply</Label>
            <Textarea
              id="reply-message"
              value={replyDraft}
              onChange={(event) => setReplyDraft(event.target.value)}
              rows={5}
              placeholder="Let the support team know any updates or ask for more info."
            />
          </div>

          <DialogFooter className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={closeReplyModal} type="button">
              Cancel
            </Button>
            <Button onClick={handleReplySubmit} disabled={isReplying}>
              {isReplying ? 'Sending...' : 'Send reply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}