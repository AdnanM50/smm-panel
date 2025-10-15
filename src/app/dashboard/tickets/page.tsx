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
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");

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
        <Card className="p-6">
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
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select value={subcategory} onValueChange={setSubcategory}>
                <SelectTrigger id="subcategory">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cancel">Cancel</SelectItem>
                  <SelectItem value="refill">Refill</SelectItem>
                  <SelectItem value="speed">Speed</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="orderId">Order ID</Label>
              <Input id="orderId" placeholder="Enter order ID" />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={6}
                placeholder="Describe your issue..."
                className="resize-none"
              />
            </div>

            <Button variant="ghost" className="w-full justify-start text-primary">
              <Paperclip className="w-4 h-4 mr-2" />
              Attach files
            </Button>

            <Button className="w-full" size="lg">
              Submit ticket
            </Button>
          </div>
        </Card>

        {/* My Support Requests */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-primary" />
            My support requests
          </h2>

          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 rounded-lg border bg-card hover:border-primary/40 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                      S
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium group-hover:text-primary transition-colors">
                        #{ticket.id} - {ticket.title}
                      </p>
                      <p className={`text-sm font-medium ${ticket.statusColor}`}>
                        {ticket.status}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {ticket.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
