"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useAuth } from '@/context/AuthContext'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toster'
import { toast as sonnerToast } from 'sonner'
import { Trash2 } from 'lucide-react'

const API_BASE_URL = "https://smm-panel-khan-it.up.railway.app/api"

type User = {
  _id: string
  username?: string
  name?: string
  email?: string
  balance?: number
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

  // search state (filter by email)
  const [searchEmail, setSearchEmail] = useState('')

  const fetchUsers = async () => {
    if (!token) {
      setError('No auth token')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/viewUserList`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', token },
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
        role: u.role,
        createdAt: u.createdAt,
        raw: u,
      }))

      setUsers(normalized)
    } catch (err: any) {
      console.error('fetch users error', err)
      setError(err?.message || 'Network error')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token])

  const handleDeleteClick = (id: string) => {
    setDeletingId(id)
    setConfirmOpen(true)
  }

  // memoized filtered users by email (client-side)
  const filteredUsers = useMemo(() => {
    if (!users) return users
    const q = searchEmail.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => (u.email || '').toLowerCase().includes(q))
  }, [users, searchEmail])
  const handleConfirmDelete = async () => {
    if (!deletingId) return
    if (!token) {
      sonnerToast.error('Not authorized: Missing token')
      return
    }

  setConfirmOpen(false)
    try {
      const res = await fetch(`${API_BASE_URL}/profileDelete/${deletingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', token },
      })
      const data = await res.json()
      if (res.ok && (data.status === 'Success' || data.success)) {
  // show success toast via sonner (Toaster mounted in app/layout)
  sonnerToast.success(data.message || 'User was removed')

        // update local users list in realtime by removing the deleted user
        setUsers((prev) => (prev ? prev.filter((u) => u._id !== deletingId) : prev))
        
      } else {
        console.warn('delete failed', data)
  sonnerToast.error(data.message || 'Could not delete user')
      }
    } catch (err: any) {
      console.error('delete error', err)
      sonnerToast.error(String(err) || 'Network error')
    } finally {
      
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-4 my-9 lg:p-6">
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage registered users</p>
        </div>

        {/* controls: search + refresh */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            aria-label="Search by email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Search by email"
            className="w-full sm:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className=" w-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading users...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : filteredUsers && filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users found</div>
        ) : (
        <div className="">
            <div className="overflow-x-auto ">
            <Table className="table-fixed ">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-normal">Username</TableHead>
                  <TableHead className="whitespace-normal">Name</TableHead>
                  <TableHead className="whitespace-normal">Email</TableHead>
                  <TableHead className="whitespace-normal">Role</TableHead>
                  <TableHead className="whitespace-normal">Balance</TableHead>
                  <TableHead className="whitespace-normal">Created</TableHead>
                  <TableHead className="whitespace-normal">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell className="font-mono whitespace-normal truncate max-w-[8rem] sm:max-w-[12rem]">{u.username || '—'}</TableCell>
                    <TableCell className="whitespace-normal truncate max-w-[10rem] sm:max-w-[20rem]">{u.name || '—'}</TableCell>
                    <TableCell className="whitespace-normal break-words truncate max-w-[12rem] sm:max-w-[28rem]">{u.email || '—'}</TableCell>
                    <TableCell className="whitespace-normal truncate max-w-[6rem]">{u.role || 'user'}</TableCell>
                    <TableCell className="whitespace-normal truncate max-w-[8rem]">{typeof u.balance === 'number' ? u.balance.toFixed(4) : '—'}</TableCell>
                    <TableCell className="whitespace-normal truncate max-w-[12rem]">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          title="Delete user"
                          onClick={() => handleDeleteClick(u._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        )}
      </div>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>Are you sure you want to delete this user? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
  )
}