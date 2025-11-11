"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from '@/context/AuthContext'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toster'
import { toast as sonnerToast } from 'sonner'
import { Trash2, RefreshCw } from 'lucide-react'

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
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

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
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token])

  const handleDeleteClick = (id: string) => {
    setDeletingId(id)
    setConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingId) return
    if (!token) {
      sonnerToast.error('Not authorized: Missing token')
      return
    }

    setConfirmOpen(false)
    setRefreshing(true)
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
      setRefreshing(false)
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-4 my-9 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage registered users</p>
        </div>
        <div className="flex items-center gap-2">
        
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading users...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : users && users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell className="font-mono">{u.username || '—'}</TableCell>
                    <TableCell>{u.name || '—'}</TableCell>
                    <TableCell>{u.email || '—'}</TableCell>
                    <TableCell>{u.role || 'user'}</TableCell>
                    <TableCell>{typeof u.balance === 'number' ? u.balance.toFixed(4) : '—'}</TableCell>
                    <TableCell>{u.createdAt ? new Date(u.createdAt).toLocaleString() : '—'}</TableCell>
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
        )}
      </div>

      {/* Confirmation Dialog */}
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
  )
}
