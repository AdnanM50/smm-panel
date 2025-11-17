"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/context/AuthContext"
import { toast } from "@/hooks/use-toster"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const API_BASE_URL = "https://smm-panel-khan-it.up.railway.app/api"

type RefillOrder = {
  _id: string
  email: string
  serviceName?: string
  link?: string
  quantity?: number | string
  charge?: number | string
  status?: string
  refill?: boolean
  createdAt?: string
}

const formatDateTime = (value?: string) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
}

const statusVariant = (status?: string) => {
  switch (String(status ?? "").toLowerCase()) {
    case "completed":
    case "success":
      return "default" as const
    case "processing":
    case "pending":
      return "secondary" as const
    case "canceled":
    case "cancelled":
    case "error":
      return "destructive" as const
    default:
      return "outline" as const
  }
}

const RefillPage = () => {
  const { token } = useAuth()
  const [orders, setOrders] = useState<RefillOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [bulkRefilling, setBulkRefilling] = useState(false)

  const fetchOrders = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/viewOrderList`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token,
        },
      })

      const data = await response.json()
      const rawList: any[] = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.orders)
          ? data.orders
          : []

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load orders")
      }

      const normalized = rawList
        .filter((item) => item && (item._id || item.id))
        .map(
          (item): RefillOrder => ({
            _id: String(item._id ?? item.id),
            email: item.email ?? item.userEmail ?? "",
            serviceName: item.serviceName,
            link: item.link,
            quantity: item.quantity,
            charge: item.charge,
            status: item.status,
            refill: !!item.refill,
            createdAt: item.createdAt,
          }),
        )

      setOrders(normalized.filter((order) => order.refill))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load orders"
      setError(message)
      toast({ title: "Unable to load refill orders", description: message })
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  

  const handleRefill = async (orderIds: string[], isBulk = false) => {
    if (!token || orderIds.length === 0) return

    if (isBulk) setBulkRefilling(true)
    setPendingIds((prev) => {
      const next = new Set(prev)
      orderIds.forEach((id) => next.add(id))
      return next
    })

    try {
      const endpoint = orderIds.length > 1 ? `${API_BASE_URL}/requestMultipleRefills` : `${API_BASE_URL}/requestRefill`

      const body = orderIds.length > 1 ? { orderIds } : { orderId: orderIds[0] }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      const success = response.ok && (String(data?.status).toLowerCase() === "success" || data?.success === true)

      if (success) {
        const successMessage = data?.message || `${orderIds.length} refill request${orderIds.length > 1 ? "s" : ""} sent.`
        toast({ title: "Refill requested", description: successMessage })
        // clear selection for refilled ids
        setSelectedIds((prev) => {
          const next = new Set(prev)
          orderIds.forEach((id) => next.delete(id))
          return next
        })
      } else {
        const message = data?.message || "Unable to request refill"
        toast({ title: "Refill failed", description: message })
      }
    } catch (err) {
      toast({ title: "Network error", description: "Could not reach the server. Please try again." })
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev)
        orderIds.forEach((id) => next.delete(id))
        return next
      })
      if (isBulk) setBulkRefilling(false)
    }
  }

  const refillOrders = useMemo(
    () =>
      [...orders].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bTime - aTime
      }),
    [orders],
  )

  const allVisibleSelected = refillOrders.length > 0 && refillOrders.every((o) => selectedIds.has(o._id))

  const toggleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked) {
      setSelectedIds(new Set(refillOrders.map((o) => o._id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="gap-3 sm:flex sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Refill Queue</CardTitle>
            <CardDescription>Only orders flagged for refill are displayed below.</CardDescription>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleRefill(Array.from(selectedIds), true)}
              disabled={selectedIds.size === 0 || bulkRefilling || !token}
              className="w-full sm:w-auto"
            >
              {bulkRefilling ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}
              Refill ({selectedIds.size})
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={fetchOrders}
              disabled={loading || !token}
              className="w-full sm:w-auto"
            >
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}
              Refresh
            </Button>
          </div>
        </CardHeader>

        {error && (
          <p className="px-6 pb-2 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <div className="space-y-3 px-6 pb-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <CardContent className="px-0">
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 px-4 py-3 text-left">
                      <Checkbox
                        checked={allVisibleSelected}
                        onCheckedChange={toggleSelectAll}
                        disabled={refillOrders.length === 0}
                        aria-label="Select all refill orders"
                      />
                    </TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {refillOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                      No orders need a refill right now.
                    </TableCell>
                  </TableRow>
                ) : (
                  refillOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="px-4">
                        <Checkbox
                          checked={selectedIds.has(order._id)}
                          onCheckedChange={(checked) => {
                            setSelectedIds((prev) => {
                              const next = new Set(prev)
                              if (checked) next.add(order._id)
                              else next.delete(order._id)
                              return next
                            })
                          }}
                          aria-label={`Select order ${order._id}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{order._id}</TableCell>
                      <TableCell>{order.email || "—"}</TableCell>
                      <TableCell className="max-w-[18rem] truncate" title={order.serviceName}>
                        {order.serviceName || "Unknown service"}
                      </TableCell>
                      <TableCell>{order.quantity ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(order.status)}>{order.status || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pendingIds.has(order._id) || !token}
                          onClick={() => handleRefill([order._id])}
                        >
                          {pendingIds.has(order._id) ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}
                          Refill
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

export default RefillPage
