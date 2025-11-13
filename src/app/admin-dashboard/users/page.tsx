"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toster"
import { toast as sonnerToast } from "sonner"
import { Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"

const API_BASE_URL = "https://smm-panel-khan-it.up.railway.app/api"

type User = {
  _id: string
  username?: string
  name?: string
  email?: string
  balance?: number
  totalSpent?: number
  role?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

export default function AdminUsersPage() {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { toast } = useToast()

  const [searchEmail, setSearchEmail] = useState("")

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // When the search query changes, reset to page 1
  useEffect(() => {
    setPage(1)
  }, [searchEmail])

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setError("No auth token")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/viewUserList`, {
        method: "GET",
        headers: { "Content-Type": "application/json", token },
      })
      const data = await res.json()

      let source: any[] = []
      if (Array.isArray(data.data)) source = data.data
      else if (Array.isArray(data)) source = data

      const normalized = source.map((u: any) => ({
        _id: u._id ?? u.id,
        username: u.username,
        name: u.name,
        email: u.email,
        balance: u.balance,
        totalSpent:
          typeof u.totalSpent === "number"
            ? u.totalSpent
            : typeof u.totalSpent === "number"
            ? u.totalSpent
            : u.totalSpent
            ? Number(u.totalSpent)
            : undefined,
        role: u.role,
        createdAt: u.createdAt,
        raw: u,
      }))

      setUsers(normalized)
    } catch (err: any) {
      console.error("fetch users error", err)
      setError(err?.message || "Network error")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    fetchUsers()
  }, [token, fetchUsers])

  const handleDeleteClick = (id: string) => {
    setDeletingId(id)
    setConfirmOpen(true)
  }

  const filteredUsers = useMemo(() => {
    if (!users) return users
    const q = searchEmail.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => (u.email || "").toLowerCase().includes(q))
  }, [users, searchEmail])

  const totalItems = filteredUsers ? filteredUsers.length : 0
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
    if (page < 1) setPage(1)
  }, [page, totalPages])

  const paginatedUsers = useMemo(() => {
    if (!filteredUsers) return filteredUsers
    const start = (page - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, page, pageSize])

  // Page numbers to render (keeps number of buttons reasonable)
  const pageNumbers = useMemo(() => {
    const maxButtons = 7
    if (totalPages <= maxButtons) return Array.from({ length: totalPages }, (_, i) => i + 1)
    let start = Math.max(1, page - 3)
    let end = Math.min(totalPages, page + 3)
    if (start === 1) end = Math.min(totalPages, maxButtons)
    if (end === totalPages) start = Math.max(1, totalPages - maxButtons + 1)
    const out: number[] = []
    for (let i = start; i <= end; i++) out.push(i)
    return out
  }, [page, totalPages])

  // helper to format amounts; keep cents for >= $1, more precision for small values
  const formatAmount = (v?: number) => {
    if (typeof v !== "number") return "—"
    if (Math.abs(v) >= 1) return `$${v.toFixed(2)}`
    return `$${v.toFixed(4)}`
  }

  const handleConfirmDelete = async () => {
    if (!deletingId) return
    if (!token) {
      sonnerToast.error("Not authorized: Missing token")
      return
    }

    setConfirmOpen(false)
    try {
      const res = await fetch(`${API_BASE_URL}/profileDelete/${deletingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", token },
      })
      const data = await res.json()
      if (res.ok && (data.status === "Success" || data.success)) {
        sonnerToast.success(data.message || "User was removed")
        setUsers((prev) => (prev ? prev.filter((u) => u._id !== deletingId) : prev))
      } else {
        console.warn("delete failed", data)
        sonnerToast.error(data.message || "Could not delete user")
      }
    } catch (err: any) {
      console.error("delete error", err)
      sonnerToast.error(String(err) || "Network error")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="w-full min-h-screen space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Manage registered users</p>
        </div>

        <div className="w-full">
          <Input
            aria-label="Search by email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Search by email..."
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 sm:p-8 text-center text-sm text-gray-500">Loading users...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 text-sm">{error}</div>
        ) : filteredUsers && filteredUsers.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500 text-sm">No users found</div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="text-left px-3 sm:px-4 py-3 font-semibold">Username</th>
                    <th className="text-left px-3 sm:px-4 py-3 font-semibold">Name</th>
                    <th className="text-left px-3 sm:px-4 py-3 font-semibold">Email</th>
                    <th className="text-left px-3 sm:px-4 py-3 font-semibold">Role</th>
                    <th className="text-left px-3 sm:px-4 py-3 font-semibold">Balance</th>
                    <th className="text-left px-3 sm:px-4 py-3 font-semibold">Total Spent</th>
                    <th className="text-left px-3 sm:px-4 py-3 font-semibold">Joining date</th>
                    <th className="text-left px-3 sm:px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers?.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-3 sm:px-4 py-3 font-mono text-xs sm:text-sm">{u.username || "—"}</td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm truncate">{u.name || "—"}</td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm max-w-[18rem]">
                        <div className="truncate" title={u.email}>
                          {u.email || "—"}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">
                        <span className="inline-block px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs">
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium">
                        {typeof u.balance === "number" ? `$${u.balance.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium">
                        {formatAmount(u.totalSpent)}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <button
                          title="Delete user"
                          onClick={() => handleDeleteClick(u._id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg inline-flex transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="hidden md:block lg:hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="text-left px-3 py-3 font-semibold">Email</th>
                    <th className="text-left px-3 py-3 font-semibold">Name</th>
                    <th className="text-left px-3 py-3 font-semibold">Role</th>
                    <th className="text-left px-3 py-3 font-semibold">Balance</th>
                    <th className="text-center px-3 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers?.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-3 py-3 text-xs max-w-[14rem]">
                        <div className="truncate" title={u.email}>
                          {u.email || "—"}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs truncate">{u.name || "—"}</td>
                      <td className="px-3 py-3 text-xs">
                        <span className="inline-block px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs">
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs font-medium">
                        {typeof u.balance === "number" ? `$${u.balance.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-3 py-3 text-xs font-medium">
                        {formatAmount(u.totalSpent)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          title="Delete user"
                          onClick={() => handleDeleteClick(u._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded inline-flex transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedUsers?.map((u) => (
                <div key={u._id} className="p-4 space-y-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {/* Header row with email and delete button */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email
                      </p>
                      <p
                        className="text-sm font-medium text-gray-900 dark:text-white break-words mt-0.5 truncate"
                        title={u.email}
                      >
                        {u.email || "—"}
                      </p>
                    </div>
                    <button
                      title="Delete user"
                      onClick={() => handleDeleteClick(u._id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex-shrink-0 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Two-column grid for key info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white break-words mt-0.5">{u.name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </p>
                      <div className="mt-0.5">
                        <span className="inline-block px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium">
                          {u.role || "user"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Balance and Created date */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Balance
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                        {typeof u.balance === "number" ? `$${u.balance.toFixed(2)}` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Spent
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                        {formatAmount(u.totalSpent)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Joining date
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Username - full width */}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Username
                    </p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all mt-0.5">
                      {u.username || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          {/* Pagination controls - moved inside the content card so it appears as the card footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Show</label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPage(1)
                  }}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm rounded px-2 py-1"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
              </div>

              {/* Full controls for small+ and up */}
              <div className="hidden sm:flex items-center gap-2 text-sm">
                {/* First button removed to simplify controls */}
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50"
                >
                  Prev
                </button>

                <div className="flex items-center gap-1 px-2">
                  {pageNumbers[0] > 1 && (
                    <button onClick={() => setPage(1)} className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      1
                    </button>
                  )}
                  {pageNumbers[0] > 2 && <span className="px-1 text-gray-500">…</span>}
                  {pageNumbers.map((pn) => (
                    <button
                      key={pn}
                      onClick={() => setPage(pn)}
                      aria-current={pn === page}
                      className={
                        pn === page
                          ? "px-2 py-1 rounded border bg-blue-600 text-white border-blue-600"
                          : "px-2 py-1 rounded border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      }
                    >
                      {pn}
                    </button>
                  ))}
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="px-1 text-gray-500">…</span>}
                  {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <button onClick={() => setPage(totalPages)} className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      {totalPages}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50"
                >
                  Next
                </button>
                {/* Last button removed to simplify controls */}

                <div className="ml-3 text-sm text-gray-600 dark:text-gray-400">Page {page} of {totalPages} — {totalItems} users</div>
              </div>

              {/* Compact controls for xs */}
              <div className="flex sm:hidden items-center gap-2 text-sm">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50"
                >
                  Prev
                </button>
                <div className="px-2 text-sm text-gray-600 dark:text-gray-400">{page} / {totalPages}</div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          </>
        )}
      </div>
      {/* Delete confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="w-[90vw] sm:w-full mx-auto">
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} className="w-full sm:w-auto">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
