"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Ban, Loader2, Search } from "lucide-react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/AuthContext"

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
			const rawList: any[] = Array.isArray(data?.data)
				? data.data
				: Array.isArray(data?.orders)
				? data.orders
				: []

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
			toast.error("Fetching orders failed", {
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
			const fields = [
				order._id,
				order.apiOrderId,
				order.email,
				order.serviceName,
				order.status,
			]
				.filter(Boolean)
				.map((value) => String(value).toLowerCase())
			return fields.some((value) => value.includes(q))
		})
	}, [orders, search])

	const allVisibleSelected =
		filteredOrders.length > 0 &&
		filteredOrders.every((order) => selectedIds.has(order._id))

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
						return [id, {
							status: item?.status,
							updatedAt: item?.updatedAt,
							charge: item?.charge,
							actualCharge: item?.actualCharge,
						}]
					})
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
					})
				)

				setSelectedIds((prev) => {
					const next = new Set(prev)
					orderIds.forEach((id) => next.delete(id))
					return next
				})

				const successMessage = data?.message || `${orderIds.length} order${orderIds.length > 1 ? "s" : ""} cancelled successfully.`
				toast.success("Orders cancelled", {
					description: successMessage,
				})
			} else {
				const message = data?.message || "Unable to cancel orders"
				toast.error("Cancellation failed", {
					description: message,
				})
			}
		} catch (err) {
			toast.error("Network error", {
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
		<div className="space-y-6 p-6">
			<header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="space-y-1">
					<h1 className="text-3xl font-semibold tracking-tight">Order Manager</h1>
					<p className="text-sm text-muted-foreground">
						Monitor every order, search by customer or service, and cancel in bulk when needed.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button
						variant="destructive"
						disabled={selectedIds.size === 0 || bulkCancelling}
						onClick={() => handleCancel(Array.from(selectedIds), true)}
					>
						{bulkCancelling ? <Loader2 className="size-4 animate-spin" /> : <Ban className="size-4" />}
						Cancel selected ({selectedIds.size})
					</Button>
				</div>
			</header>

			<div className="relative max-w-sm">
				<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<input
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder="Search by email, status, or order ID"
					className="w-full rounded-lg border bg-background/60 py-2 pl-10 pr-3 text-sm shadow-sm outline-none transition focus:border-primary"
				/>
			</div>

			<section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
				<div className="border-b bg-muted/30 px-4 py-3">
					<div className="flex items-center justify-between text-sm text-muted-foreground">
						<span>
							Showing {filteredOrders.length} of {orders.length} orders
						</span>
						<span>{selectedIds.size} selected</span>
					</div>
				</div>

				<Table>
					<TableHeader className="bg-muted/50">
						<TableRow>
							<TableHead className="w-12">
								<Checkbox
									checked={allVisibleSelected}
									onCheckedChange={toggleSelectAll}
									disabled={filteredOrders.length === 0}
									aria-label="Select all orders"
								/>
							</TableHead>
							<TableHead>Order ID</TableHead>
							<TableHead>Customer</TableHead>
							<TableHead>Service</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className="text-right">Charge</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{loading &&
							Array.from({ length: 6 }).map((_, index) => (
								<TableRow key={index}>
									<TableCell className="w-12">
										<Skeleton className="h-4 w-4 rounded" />
									</TableCell>
									<TableCell colSpan={7}>
										<Skeleton className="h-6 w-full" />
									</TableCell>
								</TableRow>
							))}

						{!loading && filteredOrders.length === 0 && (
							<TableRow>
								<TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
									{error || "No orders match the current filters."}
								</TableCell>
							</TableRow>
						)}

						{!loading &&
							filteredOrders.map((order) => {
												const isSelected = selectedIds.has(order._id)
												const isPending = pendingIds.has(order._id)
												const chargeValue = normalizeNumber(order.charge)
												const actualValue = normalizeNumber(order.actualCharge)
												const showActual = actualValue !== undefined && actualValue !== chargeValue
								return (
									<TableRow key={order._id} data-state={isSelected ? "selected" : undefined}>
										<TableCell>
											<Checkbox
												checked={isSelected}
												onCheckedChange={(value) => toggleRow(order._id, value)}
												aria-label={`Select order ${order._id}`}
											/>
										</TableCell>
										<TableCell>
											<div className="flex flex-col">
												<span className="font-medium">{order._id}</span>
												{order.apiOrderId && (
													<span className="text-xs text-muted-foreground">API #{order.apiOrderId}</span>
												)}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col">
												<span className="font-medium">{order.email || "—"}</span>
												{order.quantity !== undefined && (
													<span className="text-xs text-muted-foreground">Qty {order.quantity}</span>
												)}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col">
												<span className="font-medium">{order.serviceName || "—"}</span>
												{order.link && (
													<a
														href={order.link}
														target="_blank"
														rel="noreferrer"
														className="text-xs text-primary hover:underline"
													>
														View link
													</a>
												)}
											</div>
										</TableCell>
										<TableCell>
											<Badge variant={getStatusVariant(order.status)} className="capitalize">
												{order.status || "Unknown"}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex flex-col">
												<span>{formatDate(order.createdAt)}</span>
												<span className="text-xs text-muted-foreground">{formatTime(order.createdAt)}</span>
											</div>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex flex-col items-end">
																	<span>{formattedTotal(order.charge)}</span>
																	{showActual && (
													<span className="text-xs text-muted-foreground">
																			Actual {formattedTotal(order.actualCharge)}
													</span>
												)}
											</div>
										</TableCell>
										<TableCell className="text-right">
																	<Button
																		variant="ghost"
																		size="icon"
																		onClick={() => handleCancel([order._id])}
																		disabled={isPending}
																		aria-label={`Cancel order ${order._id}`}
																	>
																		{isPending ? <Loader2 className="size-4 animate-spin" /> : <Ban className="size-4" />}
																	</Button>
										</TableCell>
									</TableRow>
								)
							})}
					</TableBody>
				</Table>
			</section>
		</div>
	)
}

