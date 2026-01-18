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
import { Trash2, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

const API_BASE_URL = "https://smm-panel-khan-it.vercel.app/api"

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
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newRole, setNewRole] = useState("user")
  const [showPassword, setShowPassword] = useState(false)
  const [adding, setAdding] = useState(false)
  const { toast } = useToast()
  const [searchEmail, setSearchEmail] = useState("")
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
      // Use the app's toast system (Toaster) instead of external sonner
      toast({ title: "Not authorized", description: "Missing token", variant: "destructive" })
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
        toast({ title: "User removed", description: data.message || "User was removed" })
        setUsers((prev) => (prev ? prev.filter((u) => u._id !== deletingId) : prev))
      } else {
        console.warn("delete failed", data)
        toast({ title: "Could not delete user", description: data.message || "Could not delete user", variant: "destructive" })
      }
    } catch (err: any) {
      console.error("delete error", err)
  toast({ title: "Network error", description: String(err) || "Network error", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  // Change role handler (optimistic UI)
  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!token) {
      toast({ title: "Not authorized", description: "Missing token", variant: "destructive" })
      return
    }

    // Optimistic update
    const prev = users
    setUsers((u) => (u ? u.map((x) => (x._id === userId ? { ...x, role: newRole } : x)) : u))

    try {
      const res = await fetch(`${API_BASE_URL}/profileUpdate/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({ role: newRole }),
      })
      const data = await res.json()
      if (res.ok && (data.status === "Success" || data.success)) {
        toast({ title: "Role updated", description: `Role changed to ${newRole}` })
      } else {
        throw new Error(data?.message || "Update failed")
      }
    } catch (err: any) {
      console.error("update role error", err)
      toast({ title: "Could not update role", description: String(err), variant: "destructive" })
      // revert
      setUsers(prev)
    }
  }

  const handleAddUser = async () => {
    if (!newEmail || !newPassword || !newName || !newUsername) {
      toast({ title: "Invalid input", description: "Please fill all fields", variant: "destructive" })
      return
    }
    if (newPassword.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters", variant: "destructive" })
      return
    }

    setAdding(true)
    try {
      const body = { email: newEmail, username: newUsername, name: newName, password: newPassword, role: newRole }
      const res = await fetch(`${API_BASE_URL}/registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { token } : {}) },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok && (data.status === "Success" || data.success)) {
        toast({ title: "User created", description: data.message || "User successfully registered" })
        setAddOpen(false)
        setNewName("")
        setNewUsername("")
        setNewEmail("")
        setNewPassword("")
        setNewRole("user")
        fetchUsers()
      } else {
        toast({ title: "Create failed", description: data?.message || data?.msg || "Could not create user", variant: "destructive" })
      }
    } catch (err: any) {
      console.error("add user error", err)
      toast({ title: "Network error", description: String(err) || "Network error", variant: "destructive" })
    } finally {
      setAdding(false)
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
          <div className="flex items-center justify-end pt-3">
            <Button onClick={() => setAddOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
              Add User
            </Button>
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
                        <Select value={u.role || "user"} onValueChange={(val) => handleRoleChange(u._id, val)}>
                            <SelectTrigger
                              size="sm"
                              className="w-[7.5rem] border border-gray-200 dark:border-gray-700 rounded-md bg-gradient-to-b from-white/50 to-transparent dark:from-gray-800/40 dark:to-transparent px-2 py-1 shadow-sm hover:shadow-md transition-shadow focus-visible:ring-2 focus-visible:ring-blue-400/50"
                            >
                              <SelectValue>
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-300/90" />
                                  <span className="text-xs font-medium text-blue-800 dark:text-blue-200">{u.role || "user"}</span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="border border-gray-200 dark:border-gray-700 shadow-lg">
                              <SelectItem value="user" className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                                <span>User</span>
                              </SelectItem>
                              <SelectItem value="agent" className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                                <span>Agent</span>
                              </SelectItem>
                              <SelectItem value="admin" className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-rose-500" />
                                <span>Admin</span>
                              </SelectItem>
                            </SelectContent>
                        </Select>
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
                        <Select value={u.role || "user"} onValueChange={(val) => handleRoleChange(u._id, val)}>
                          <SelectTrigger
                            size="sm"
                            className="w-[6.5rem] border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow focus-visible:ring-2 focus-visible:ring-blue-400/50"
                          >
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-300/90" />
                                <span className="text-xs font-medium text-blue-800 dark:text-blue-200">{u.role || "user"}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="border border-gray-200 dark:border-gray-700 shadow-lg">
                            <SelectItem value="user" className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500" />User</SelectItem>
                            <SelectItem value="agent" className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-500" />Agent</SelectItem>
                            <SelectItem value="admin" className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-500" />Admin</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Select value={u.role || "user"} onValueChange={(val) => handleRoleChange(u._id, val)}>
                          <SelectTrigger
                            size="sm"
                            className="w-full border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow focus-visible:ring-2 focus-visible:ring-blue-400/50"
                          >
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-300/90" />
                                <span className="text-xs font-medium text-blue-800 dark:text-blue-200">{u.role || "user"}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="border border-gray-200 dark:border-gray-700 shadow-lg">
                            <SelectItem value="user" className="flex items-center gap-2"> <span className="h-2 w-2 rounded-full bg-blue-500" />User</SelectItem>
                            <SelectItem value="agent" className="flex items-center gap-2"> <span className="h-2 w-2 rounded-full bg-indigo-500" />Agent</SelectItem>
                            <SelectItem value="admin" className="flex items-center gap-2"> <span className="h-2 w-2 rounded-full bg-rose-500" />Admin</SelectItem>
                          </SelectContent>
                        </Select>
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
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="w-[90vw] sm:w-[480px] mx-auto">
          <DialogHeader>
            <DialogTitle>Add new user</DialogTitle>
            <DialogDescription>Provide details to create a new user account.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 mt-3">
            <label className="text-xs text-gray-600">Name</label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" />
            <label className="text-xs text-gray-600">Username</label>
            <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Username" />
            <label className="text-xs text-gray-600">Email</label>
            <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email address" />
            <label className="text-xs text-gray-600">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <label className="text-xs text-gray-600">Role</label>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full rounded border px-2 py-1 bg-white dark:bg-gray-800">
              <option value="user">User</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setAddOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleAddUser} className="w-full sm:w-auto" disabled={adding}>{adding ? 'Creating...' : 'Create user'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
