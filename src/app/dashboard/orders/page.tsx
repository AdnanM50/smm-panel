'use client'
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MoreVertical } from "lucide-react";

export default function Orders() {
  const orders = [
    {
      id: "7333963",
      service: "2199 - Telegram Like (🔥) Reaction Views [Max 1M] INSTANT",
      link: "https://web.telegram.org/a/#8092633438",
      status: "Completed",
      date: "2025-10-04 12:59:21",
    },
    {
      id: "7333962",
      service: "4084 - Telegram Members Channel/Group [ Refill:3 Days ] [ 50K/Days] INSTANT",
      link: "https://web.telegram.org/a/#8092633438",
      status: "Canceled",
      date: "2025-10-04 12:59:21",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground mt-1">View and manage your orders</p>
      </div>

      <Card className="p-6 bg-gradient-card border-border">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Button className="bg-gradient-primary">
            <Filter className="mr-2 h-4 w-4" />
            Filter Orders
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="pl-10 bg-background border-border"
            />
          </div>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="p-4 bg-background border-border hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        order.status === "Completed"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }
                    >
                      {order.id}
                    </Badge>
                    <Badge
                      className={
                        order.status === "Completed"
                          ? "bg-success text-success-foreground"
                          : "bg-destructive text-destructive-foreground"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-foreground">{order.service}</h3>
                  <p className="text-sm text-muted-foreground">{order.link}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden lg:block">{order.date}</span>
                  <Button className="bg-gradient-primary">
                    order again
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
