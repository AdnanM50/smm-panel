"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Ban, Loader2, Search } from "lucide-react"
import { toast } from "@/hooks/use-toster"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/AuthContext"
import { Input } from "@/components/ui/input"

const API_BASE_URL = "https://smm-panel-khan-it.up.railway.app/api"

type AdminOrder = {
  _id: string
  email: string
  serviceId?: number
  serviceName?: string
  link?: string
  quantity?: number | string
  charge?: number | string
  actualCharge?: number | string
  profit?: number | string
  apiOrderId?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

export default function AdminOrdersPage() {
  const { token } = useAuth()

  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [bulkCancelling, setBulkCancelling] = useState(false)

  const fetchOrders = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    setSelectedIds(new Set())

    try {
      const response = await fetch(`${API_BASE_URL}/viewOrderList`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token,
        },
      })

      const data = await response.json()
      const rawList: any[] = Array.isArray(data?.data) ? data.data : Array.isArray(data?.orders) ? data.orders : []

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load orders")
      }

      const normalized: AdminOrder[] = rawList
        .filter((item) => item && (item._id || item.id))
        .map((item) => ({
          _id: String(item._id ?? item.id),
          email: item.email ?? item.userEmail ?? "",
          serviceId: typeof item.serviceId === "number" ? item.serviceId : Number(item.serviceId),
          serviceName: item.serviceName,
          link: item.link,
          quantity: item.quantity,
          charge: item.charge,
          actualCharge: item.actualCharge,
          profit: item.profit,
          apiOrderId: item.apiOrderId,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }))

      normalized.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bTime - aTime
      })

      setOrders(normalized)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load orders"
      setError(message)
      toast({
        title: "Fetching orders failed",
        description: message,
      })
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    fetchOrders()
  }, [token, fetchOrders])

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders
    const q = search.toLowerCase()
    return orders.filter((order) => {
      const fields = [order._id, order.apiOrderId, order.email, order.serviceName, order.status]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase())
      return fields.some((value) => value.includes(q))
    })
  }, [orders, search])

  const allVisibleSelected = filteredOrders.length > 0 && filteredOrders.every((order) => selectedIds.has(order._id))

  const toggleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked) {
      setSelectedIds(new Set(filteredOrders.map((order) => order._id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const toggleRow = (orderId: string, checked: boolean | "indeterminate") => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(orderId)
      } else {
        next.delete(orderId)
      }
      return next
    })
  }

  const handleCancel = async (orderIds: string[], isBulk = false) => {
    if (!token || orderIds.length === 0) return

    if (isBulk) setBulkCancelling(true)
    setPendingIds((prev) => {
      const next = new Set(prev)
      orderIds.forEach((id) => next.add(id))
      return next
    })

    try {
      const response = await fetch(`${API_BASE_URL}/cancelOrders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify({ orderIds }),
      })

      const data = await response.json()
      const success = response.ok && String(data?.status).toLowerCase() === "success"

  if (success) {
        const updatesArray = Array.isArray(data?.data) ? data.data : []
        const updatesMap = new Map<string, Partial<AdminOrder>>(
          updatesArray.map((item: any) => {
            const id = String(item?._id ?? item?.id ?? item?.orderId ?? "")
            return [
              id,
              {
                status: item?.status,
                updatedAt: item?.updatedAt,
                charge: item?.charge,
                actualCharge: item?.actualCharge,
              },
            ]
          }),
        )

        setOrders((prev) =>
          prev.map((order) => {
            if (!orderIds.includes(order._id)) return order
            const update = updatesMap.get(order._id) || updatesMap.get(order.apiOrderId ?? "")
            return {
              ...order,
              status: update?.status ?? "Canceled",
              updatedAt: update?.updatedAt ?? new Date().toISOString(),
              charge: update?.charge ?? order.charge,
              actualCharge: update?.actualCharge ?? order.actualCharge,
            }
          }),
        )

        setSelectedIds((prev) => {
          const next = new Set(prev)
          orderIds.forEach((id) => next.delete(id))
          return next
        })

        const successMessage =
          data?.message || `${orderIds.length} order${orderIds.length > 1 ? "s" : ""} cancelled successfully.`
        toast({
          title: "Orders cancelled",
          description: successMessage,
        })
      } else {
        const message = data?.message || "Unable to cancel orders"
        toast({
          title: "Cancellation failed",
          description: message,
        })
      }
    } catch (err) {
      toast({
        title: "Network error",
        description: "We could not reach the server. Please try again.",
      })
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev)
        orderIds.forEach((id) => next.delete(id))
        return next
      })
      if (isBulk) setBulkCancelling(false)
    }
  }

  const formatDate = (value?: string) => {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString()
  }

  const formatTime = (value?: string) => {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusVariant = (status?: string) => {
    switch (String(status || "").toLowerCase()) {
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

  const normalizeNumber = (value?: number | string) => {
    if (value === null || value === undefined || value === "") return undefined
    const numeric = typeof value === "number" ? value : Number(value)
    return Number.isNaN(numeric) ? undefined : numeric
  }

  const formattedTotal = (value?: number | string) => {
    const numeric = normalizeNumber(value)
    if (numeric === undefined) return "—"
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric)
  }

  return (
    <div className="w-full space-y-3 sm:space-y-4 md:space-y-6">
      <header className="flex flex-col gap-3 sm:gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Order Manager
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Monitor every order, search by customer or service, and cancel in bulk when needed.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="destructive"
            disabled={selectedIds.size === 0 || bulkCancelling}
            onClick={() => handleCancel(Array.from(selectedIds), true)}
            className="w-full sm:w-auto"
          >
            {bulkCancelling ? <Loader2 className="size-4 animate-spin" /> : <Ban className="size-4" />}
            <span>Cancel</span>
            <span className="ml-1">({selectedIds.size})</span>
          </Button>
        </div>
      </header>

      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search orders..."
          className="w-full rounded-lg border bg-background/60 py-2 pl-10 pr-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <section className="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing {filteredOrders.length} of {orders.length}
            </span>
            <span>{selectedIds.size} selected</span>
          </div>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <th className="w-12 px-4 py-3 text-left">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={toggleSelectAll}
                    disabled={filteredOrders.length === 0}
                    aria-label="Select all orders"
					className="border-gray-200"
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold">Order ID</th>
                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                <th className="px-4 py-3 text-left font-semibold">Service</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Created</th>
                <th className="px-4 py-3 text-right font-semibold">Charge</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="w-12 px-4 py-3">
                      <Skeleton className="h-4 w-4 rounded" />
                    </td>
                    <td colSpan={7} className="px-4 py-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))}

              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {error || "No orders match the current filters."}
                  </td>
                </tr>
              )}

              {!loading &&
                filteredOrders.map((order) => {
                  const isSelected = selectedIds.has(order._id)
                  const isPending = pendingIds.has(order._id)
                  const chargeValue = normalizeNumber(order.charge)
                  const actualValue = normalizeNumber(order.actualCharge)
                  const showActual = actualValue !== undefined && actualValue !== chargeValue
                  return (
                    <tr
                      key={order._id}
                      className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"}`}
                    >
                      <td className="w-12 px-4 py-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(value) => toggleRow(order._id, value)}
                          aria-label={`Select order ${order._id}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm truncate">{order._id}</span>
                          {order.apiOrderId && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">API #{order.apiOrderId}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{order.email || "—"}</span>
                          {order.quantity !== undefined && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">Qty {order.quantity}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{order.serviceName || "—"}</span>
                          {order.link && (
                            <a
                              href={order.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              View link
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusVariant(order.status)} className="capitalize text-xs">
                          {order.status || "Unknown"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col text-sm">
                          <span>{formatDate(order.createdAt)}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(order.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-medium">{formattedTotal(order.charge)}</span>
                          {showActual && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Actual {formattedTotal(order.actualCharge)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCancel([order._id])}
                          disabled={isPending}
                          aria-label={`Cancel order ${order._id}`}
                          className="h-8 w-8"
                        >
                          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Ban className="size-4" />}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {loading &&
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-3 sm:p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}

          {!loading && filteredOrders.length === 0 && (
            <div className="py-8 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {error || "No orders match the current filters."}
            </div>
          )}

          {!loading &&
            filteredOrders.map((order) => {
              const isSelected = selectedIds.has(order._id)
              const isPending = pendingIds.has(order._id)
              const chargeValue = normalizeNumber(order.charge)
              const actualValue = normalizeNumber(order.actualCharge)
              const showActual = actualValue !== undefined && actualValue !== chargeValue
              return (
                <div
                  key={order._id}
                  className={`p-3 sm:p-4 space-y-3 transition-colors ${
                    isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  {/* Top row: Order ID with checkbox and delete button */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(value) => toggleRow(order._id, value)}
                        aria-label={`Select order ${order._id}`}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Order ID
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate mt-0.5">{order._id}</p>
                        {order.apiOrderId && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">API #{order.apiOrderId}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCancel([order._id])}
                      disabled={isPending}
                      aria-label={`Cancel order ${order._id}`}
                      className="h-8 w-8 flex-shrink-0"
                    >
                      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Ban className="size-4" />}
                    </Button>
                  </div>

                  {/* Customer and Service Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Customer
                      </p>
                      <p className="text-gray-900 dark:text-white truncate mt-0.5">{order.email || "—"}</p>
                      {order.quantity !== undefined && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Qty {order.quantity}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Service
                      </p>
                      <p className="text-gray-900 dark:text-white truncate mt-0.5">{order.serviceName || "—"}</p>
                    </div>
                  </div>

                  {/* Status and Charge */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </p>
                      <div className="mt-0.5">
                        <Badge variant={getStatusVariant(order.status)} className="capitalize text-xs">
                          {order.status || "Unknown"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Charge
                      </p>
                      <p className="text-gray-900 dark:text-white font-medium mt-0.5">{formattedTotal(order.charge)}</p>
                      {showActual && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          Actual {formattedTotal(order.actualCharge)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date info - full width */}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white mt-0.5">
                      {formatDate(order.createdAt)} {formatTime(order.createdAt)}
                    </p>
                  </div>

                  {order.link && (
                    <div className="pt-2">
                      <a
                        href={order.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline block truncate"
                      >
                        View link →
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </section>
    </div>
  )
}