'use client'
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, MoreVertical, X, AlertTriangle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { getUserOrders, cancelOrders, getStatusColor, formatDate, type Order } from "./order-api";

export default function Orders() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const fetchOrders = async () => {
    if (!token) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const ordersData = await getUserOrders(token)
      setOrders(ordersData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [token])

  const handleCancelOrder = (order: Order) => {
    setOrderToCancel(order)
    setCancelModalOpen(true)
  }

  const confirmCancelOrder = async () => {
    if (!orderToCancel || !token) return
    
    setIsCancelling(true)
    try {
      const result = await cancelOrders([orderToCancel._id], token)
      
      if (result.status === 'Success') {
        toast.success("Order Cancelled", {
          description: result.message
        })
        // Refresh orders list
        await fetchOrders()
        setCancelModalOpen(false)
        setOrderToCancel(null)
      } else {
        toast.error("Cancellation Failed", {
          description: result.message
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "An error occurred while cancelling the order"
      })
    } finally {
      setIsCancelling(false)
    }
  }

  // Filter orders based on search query
  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    
    // Search by exact order ID match
    if (order.apiOrderId.toLowerCase() === query) return true
    
    // Search by partial order ID match
    if (order.apiOrderId.toLowerCase().includes(query)) return true
    
    // Search by service name
    if (order.serviceName.toLowerCase().includes(query)) return true
    
    // Search by status
    if (order.status.toLowerCase().includes(query)) return true
    
    // Search by link
    if (order.link.toLowerCase().includes(query)) return true
    
    return false
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section - Responsive */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">View and manage your orders</p>
      </div>

      <Card className="p-4 sm:p-6 bg-gradient-card border-border">
        {/* Mobile Layout (sm and below) */}
        <div className="block sm:hidden space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <Button 
              onClick={fetchOrders}
              disabled={isLoading}
              className="bg-gradient-primary flex-1"
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border h-10"
            />
          </div>
        </div>

        {/* Tablet Layout (sm to lg) */}
        <div className="hidden sm:block lg:hidden space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <Button 
              onClick={fetchOrders}
              disabled={isLoading}
              className="bg-gradient-primary"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
          </div>
        </div>

        {/* Desktop Layout (lg and above) */}
        <div className="hidden lg:flex lg:items-center lg:gap-4 mb-6">
          <Button 
            onClick={fetchOrders}
            disabled={isLoading}
            className="bg-gradient-primary"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 sm:space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-3 sm:p-4 bg-background border-border">
                {/* Mobile Skeleton */}
                <div className="block sm:hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
                
                {/* Tablet/Desktop Skeleton */}
                <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6 sm:py-8 px-4">
            <p className="text-red-500 mb-4 text-sm sm:text-base">{error}</p>
            <Button onClick={fetchOrders} variant="outline" size="sm" className="sm:size-default">
              Try Again
            </Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-6 sm:py-8 px-4">
            <p className="text-muted-foreground text-sm sm:text-base">
              {searchQuery ? 'No orders found matching your search' : 'No orders found'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredOrders.map((order) => (
              <Card
                key={order._id}
                className="p-3 sm:p-4 bg-background border-border hover:shadow-md transition-shadow"
              >
                {/* Mobile Layout (sm and below) */}
                <div className="block sm:hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono text-xs">
                        {order.apiOrderId}
                      </Badge>
                      <Badge className={`${getStatusColor(order.status)} text-xs`}>
                        {order.status}
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Qty: {order.quantity}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-foreground text-sm leading-tight">
                      {order.serviceName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 break-all" title={order.link}>
                      {order.link}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span>Charge: ${order.charge.toFixed(4)}</span>
                      <span>Profit: ${order.profit.toFixed(4)}</span>
                    </div>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    {order.status.toLowerCase() === 'processing' && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="flex-1"
                        onClick={() => handleCancelOrder(order)}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Cancel
                      </Button>
                    )}
                    <Button className="bg-gradient-primary flex-1" size="sm">
                      Order Again
                    </Button>
                  </div>
                </div>

                {/* Tablet Layout (sm to lg) */}
                <div className="hidden sm:block lg:hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono">
                        {order.apiOrderId}
                      </Badge>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Qty: {order.quantity}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-foreground">{order.serviceName}</h3>
                    <p className="text-sm text-muted-foreground truncate" title={order.link}>
                      {order.link}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Charge: ${order.charge.toFixed(4)}</span>
                      <span>Profit: ${order.profit.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.status.toLowerCase() === 'processing' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCancelOrder(order)}
                        >
                          <X className="mr-1 h-3 w-3" />
                          Cancel
                        </Button>
                      )}
                      <Button className="bg-gradient-primary" size="sm">
                        Order Again
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout (lg and above) */}
                <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono">
                        {order.apiOrderId}
                      </Badge>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Qty: {order.quantity}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-foreground">{order.serviceName}</h3>
                    <p className="text-sm text-muted-foreground truncate" title={order.link}>
                      {order.link}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Charge: ${order.charge.toFixed(4)}</span>
                      <span>Profit: ${order.profit.toFixed(4)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </span>
                    {order.status.toLowerCase() === 'processing' && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleCancelOrder(order)}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Cancel
                      </Button>
                    )}
                    <Button className="bg-gradient-primary" size="sm">
                      Order Again
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Cancel Confirmation Modal - Responsive */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Cancel Order
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {orderToCancel && (
            <div className="py-3 sm:py-4">
              <div className="p-3 sm:p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="font-mono text-xs">
                    {orderToCancel.apiOrderId}
                  </Badge>
                  <Badge className={`${getStatusColor(orderToCancel.status)} text-xs`}>
                    {orderToCancel.status}
                  </Badge>
                </div>
                <p className="font-medium text-sm sm:text-base leading-tight">{orderToCancel.serviceName}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Quantity: {orderToCancel.quantity}</span>
                  <span>Charge: ${orderToCancel.charge.toFixed(4)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCancelModalOpen(false)}
              disabled={isCancelling}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancelOrder}
              disabled={isCancelling}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isCancelling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Cancel Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
