"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Search, Loader2, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/context/AuthContext"
import { toast } from "@/hooks/use-toster"

const API_BASE_URL = "https://smm-panel-khan-it.up.railway.app/api"

type RefillItem = {
  refillId: string
  orderId?: string
  apiOrderId?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

export default function AdminRefillPage() {
  const { token } = useAuth()

  const [refills, setRefills] = useState<RefillItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [bulkChecking, setBulkChecking] = useState(false)

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

  useEffect(() => {
    const fetchRefills = async () => {
      if (!token) return
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`${API_BASE_URL}/getAllRefillsWithStatus`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token,
          },
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load refills")
        }

        const raw: any[] = Array.isArray(data?.refills) ? data.refills : []

        const normalized: RefillItem[] = raw
          .filter((r) => r && (r.refillId || r._id || r.id))
          .map((r) => ({
            refillId: String(r.refillId ?? r._id ?? r.id),
            orderId: r.orderId ?? r.order_id ?? r.orderId,
            apiOrderId: r.apiOrderId ?? r.api_order_id ?? r.apiOrderId,
            status: r.status,
            createdAt: r.createdAt ?? r.created_at,
            updatedAt: r.updatedAt ?? r.updated_at,
          }))

        normalized.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return bTime - aTime
        })

        setRefills(normalized)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load refills"
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchRefills()
  }, [token])

  const toggleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked) setSelectedIds(new Set(filtered.map((r) => r.refillId)))
    else setSelectedIds(new Set())
  }

  const toggleRow = (id: string, checked: boolean | "indeterminate") => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const updateStatusesFromArray = useCallback((updates: any[]) => {
    if (!Array.isArray(updates)) return
    setRefills((prev) =>
      prev.map((r) => {
        const match = updates.find((u) => String(u.refillId ?? u._id ?? u.id) === r.refillId)
        if (!match) return r
        return { ...r, status: match.status ?? r.status, updatedAt: match.updatedAt ?? r.updatedAt }
      }),
    )
  }, [])

  const handleCheckSingle = async (refillId: string) => {
    if (!token) return
    setPendingIds((prev) => new Set(prev).add(refillId))
    // show immediate feedback that the check was started
    toast({ title: "Checking refill", description: `Request sent to check refill ${refillId}...` })
    try {
      const res = await fetch(`${API_BASE_URL}/checkRefillStatus/${refillId}`, {
        method: "GET",
        headers: { token, "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to check refill status")

      // API returns { success: true, refillId: '...', status: 'Completed' }
      if (data) {
        updateStatusesFromArray([data])
        toast({ title: "Refill status checked", description: `Refill ${refillId} status: ${data.status}` })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to check refill"
      toast({ title: "Check failed", description: message })
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev)
        next.delete(refillId)
        return next
      })
    }
  }

  const handleCheckMultiple = async (ids: string[]) => {
    if (!token || ids.length === 0) return
    setBulkChecking(true)
    // show immediate feedback for bulk check
    toast({ title: "Checking refills", description: `Request sent to check ${ids.length} refill(s)...` })
    setPendingIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.add(id))
      return next
    })

    try {
      const res = await fetch(`${API_BASE_URL}/checkMultipleRefillStatuses`, {
        method: "POST",
        headers: { token, "Content-Type": "application/json" },
        body: JSON.stringify({ refillIds: ids }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to check multiple refill statuses")
      const updates = Array.isArray(data?.refills) ? data.refills : Array.isArray(data?.data) ? data.data : []
      updateStatusesFromArray(updates)
      toast({ title: "Refill statuses updated", description: `${ids.length} refill(s) checked` })
      // clear selection for ones updated
      setSelectedIds((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.delete(id))
        return next
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to check refills"
      toast({ title: "Bulk check failed", description: message })
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.delete(id))
        return next
      })
      setBulkChecking(false)
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return refills
    const q = search.toLowerCase()
    return refills.filter((r) => {
      const fields = [r.refillId, r.orderId, r.apiOrderId, r.status]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
      return fields.some((v) => v.includes(q))
    })
  }, [refills, search])

  return (
    <div className="w-full space-y-3">
      <header className="flex flex-col gap-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Refill Requests</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">All refill requests with current status.</p>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search refill id, order id, api order or status..."
            className="w-full rounded-lg pl-10"
          />
        </div>
      </header>

      <section className="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Showing {filtered.length} of {refills.length}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={selectedIds.size === 0 || bulkChecking}
                onClick={() => handleCheckMultiple(Array.from(selectedIds))}
                className="w-full sm:w-auto"
              >
                {bulkChecking ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                <span className="ml-2">Change status ({selectedIds.size})</span>
              </Button>
              <span>{error ? "Error loading refills" : loading ? "Refreshing..." : ""}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <th className="w-12 px-4 py-3 text-left">
                  <Checkbox
                    checked={filtered.length > 0 && filtered.every((r) => selectedIds.has(r.refillId))}
                    onCheckedChange={toggleSelectAll}
                    disabled={filtered.length === 0}
                    aria-label="Select all refills"
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold">Refill ID</th>
                <th className="px-4 py-3 text-left font-semibold">Order ID</th>
                <th className="px-4 py-3 text-left font-semibold">API Order ID</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                {/* <th className="px-4 py-3 text-left font-semibold">Created</th> */}
              </tr>
            </thead>

            <tbody>
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="w-12 px-4 py-3"><Skeleton className="h-4 w-4 rounded" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {error || "No refill requests found."}
                  </td>
                </tr>
              )}

              {!loading && filtered.map((r) => {
                const isSelected = selectedIds.has(r.refillId)
                const isPending = pendingIds.has(r.refillId)
                return (
                  <tr key={r.refillId} className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"}`}>
                    <td className="w-12 px-4 py-3">
                      <Checkbox checked={isSelected} onCheckedChange={(v) => toggleRow(r.refillId, v)} aria-label={`Select refill ${r.refillId}`} />
                    </td>
                    <td className="px-4 py-3 font-medium truncate max-w-xs">{r.refillId}</td>
                    <td className="px-4 py-3 truncate">{r.orderId ?? "—"}</td>
                    <td className="px-4 py-3 truncate">{r.apiOrderId ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusVariant(r.status)} className="capitalize text-xs">{r.status ?? "Unknown"}</Badge>
                    </td>
                    {/* <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                    </td> */}
                    
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
