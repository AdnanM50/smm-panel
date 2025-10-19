'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Headphones, Paperclip } from "lucide-react";
import { useAuth } from '@/context/AuthContext'
import { createTicket } from './tickit-api'
import { getMyTickets, Ticket as ApiTicket } from './tickit-api'
import { useEffect } from 'react'

const tickets = [
  {
    id: "22792",
    title: "Other",
    status: "Pending",
    statusColor: "text-warning",
    date: "2025-08-21 12:48:46",
  },
  {
    id: "19489",
    title: "Orders - Cancel",
    status: "Closed",
    statusColor: "text-destructive",
    date: "2025-07-09 16:26:15",
  },
  {
    id: "19490",
    title: "Orders - Cancel",
    status: "Answered",
    statusColor: "text-success",
    date: "2025-07-09 13:03:19",
  },
  {
    id: "14917",
    title: "Orders - Refill",
    status: "Answered",
    statusColor: "text-success",
    date: "2025-05-01 00:00:17",
  },
  {
    id: "14918",
    title: "Orders - Refill",
    status: "Answered",
    statusColor: "text-success",
    date: "2025-04-30 23:09:22",
  },
];

export default function Tickets() {
  const [subject, setSubject] = useState('')
  const [orderApiId, setOrderApiId] = useState('')
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [apiTickets, setApiTickets] = useState<ApiTicket[] | null>(null)
  const [rawResponse, setRawResponse] = useState<any | null>(null)

  const { token } = useAuth()

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!token) return
      setStatusMessage(null)
      setApiTickets(null)
      try {
        const res = await getMyTickets(token)
        if (!mounted) return
        setRawResponse(res)
        if (res.success) {
          setApiTickets(res.tickets)
        } else {
          setStatusMessage(res.message || 'Failed to fetch tickets')
        }
      } catch (err) {
        console.error(err)
        if (!mounted) return
        setStatusMessage('Network error while fetching tickets')
      }
    }

    load()

    return () => { mounted = false }
  }, [token])

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header Card */}
      <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Headphones className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Tickets</h1>
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

      <div className="grid lg:grid-cols-2 gap-6">
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
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ticket subject" className="dark:bg-input/60 dark:border-gray-700" />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="orderId">Order ID (apiOrderId)</Label>
              <Input id="orderId" value={orderApiId} onChange={(e) => setOrderApiId(e.target.value)} placeholder="Enter API Order ID (e.g. 7399585)" className="dark:bg-input/60 dark:border-gray-700" />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={6}
                placeholder="Describe your issue..."
                className="resize-none dark:bg-input/60 dark:border-gray-700"
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
        <Card className="p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-primary" />
            My support requests
          </h2>

          <div className="space-y-3">
            {/* Render tickets from API if available, else fallback to static tickets */}
            {(apiTickets ?? tickets).map((ticket: any) => {
              const statusKey = (ticket.status || 'open').toLowerCase()
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
                  key={ticket._id ?? ticket.id}
                  className="p-4 rounded-lg border bg-card hover:border-primary/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                        S
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {ticket.subject ?? ticket.title}
                        </p>
                        {/* Status badge */}
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${statusClass}`}>{(ticket.status || 'open')}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {ticket.createdAt ?? ticket.date}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

      
        </Card>
      </div>
    </div>
  );
}
