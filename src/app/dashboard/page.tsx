'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  TrendingUp,
  ArrowRight,
  Search,
  Plus,
  FileStack,
  MessageSquare,
  Music2,
  Linkedin,
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  Send,
  CheckCircle,
  Percent,
  User,
  Filter,
} from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchServicesFromApi, type ApiServiceItem } from "./services/service-api";
import { placeNewOrder, type PlaceOrderRequest } from "./order-api";
import { toast } from "sonner";

export default function Dashboard() {
  const { token, user } = useAuth()
  const [balance, setBalance] = useState<number | null>(null)
  const [totalSpent, setTotalSpent] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Service search and order form states
  const [searchQuery, setSearchQuery] = useState("")
  const [services, setServices] = useState<ApiServiceItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedService, setSelectedService] = useState<ApiServiceItem | null>(null)
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        if (!token) return
        setIsLoading(true)
        const res = await fetch('https://smm-panel-khan-it.onrender.com/api/getDashboardData', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            token,
          },
          next: { revalidate: 60 },
        })
        const data = await res.json()
        if (res.ok && data?.success && data?.data) {
          setBalance(Number(data.data.balance) || 0)
          setTotalSpent(Number(data.data.totalSpent) || 0)
        }
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [token])

  // Service search functionality
  const searchServices = useCallback(async (query: string) => {
    if (!token || !query.trim()) {
      setServices([])
      return
    }

    setIsSearching(true)
    try {
      // Search through multiple pages to find services
      let allServices: ApiServiceItem[] = []
      let page = 1
      const limit = 100
      let hasMorePages = true

      while (hasMorePages && page <= 10) { // Limit to 10 pages for performance
        const pageServices = await fetchServicesFromApi({
          profit: 10,
          page,
          limit,
          token,
        })
        
        allServices = [...allServices, ...pageServices]
        hasMorePages = pageServices.length === limit
        page++
      }

      // Filter services based on search query
      const filteredServices = allServices.filter(service => {
        const queryLower = query.toLowerCase()
        return (
          service.name.toLowerCase().includes(queryLower) ||
          service.service.toString().includes(query) ||
          service.category?.toLowerCase().includes(queryLower)
        )
      })

      setServices(filteredServices.slice(0, 50)) // Limit to 50 results
    } catch (error) {
      console.error('Error searching services:', error)
      toast.error("Failed to search services")
    } finally {
      setIsSearching(false)
    }
  }, [token])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchServices(searchQuery)
      } else {
        setServices([])
        setSelectedService(null)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchServices])

  // Handle service selection
  const handleServiceSelect = (service: ApiServiceItem) => {
    setSelectedService(service)
    setSearchQuery(service.name)
    setServices([])
  }

  // Calculate total charge
  const totalCharge = useMemo(() => {
    if (!selectedService || !quantity) return 0
    const qty = parseFloat(quantity)
    if (isNaN(qty)) return 0
    return (selectedService.userRate || selectedService.rate) * qty
  }, [selectedService, quantity])

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (!selectedService || !link.trim() || !quantity.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!token) {
      toast.error("Authentication required")
      return
    }

    const qty = parseFloat(quantity)
    if (isNaN(qty) || qty < selectedService.min || qty > selectedService.max) {
      toast.error(`Quantity must be between ${selectedService.min} and ${selectedService.max}`)
      return
    }

    setIsSubmitting(true)
    try {
      const orderData: PlaceOrderRequest = {
        serviceId: selectedService.service,
        link: link.trim(),
        profit: selectedService.userRate || selectedService.rate,
        quantity: qty,
      }

      const result = await placeNewOrder(orderData, token)
      
      if (result.success) {
        toast.success("Order placed successfully!", {
          description: `Order ID: ${result.order.apiOrderId}`
        })
        
        // Reset form
        setSelectedService(null)
        setSearchQuery("")
        setLink("")
        setQuantity("")
        setServices([])
      } else {
        toast.error("Failed to place order", {
          description: result.message
        })
      }
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error("Failed to place order", {
        description: "Please try again later"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const platforms = [
    { name: "All", icon: Plus },
    { name: "Telegram", icon: Send },
    { name: "Twitter", icon: Twitter },
    { name: "Discord", icon: MessageSquare },
    { name: "SoundCloud", icon: Music2 },
    { name: "LinkedIn", icon: Linkedin },
    { name: "YouTube", icon: Youtube },
    { name: "Facebook", icon: Facebook },
    { name: "Instagram", icon: Instagram },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card style={{ backgroundColor: 'var(--dashboard-bg-card)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--dashboard-text-secondary)' }}>Current Balance</CardTitle>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--dashboard-green)' }}>
              <Wallet className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <div className="text-2xl font-bold" style={{ color: 'var(--dashboard-text-primary)' }}>
                ${balance?.toFixed(5) ?? '0.00000'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: 'var(--dashboard-bg-card)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--dashboard-text-secondary)' }}>Total Spending</CardTitle>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--dashboard-red)' }}>
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <div className="text-2xl font-bold" style={{ color: 'var(--dashboard-text-primary)' }}>
                ${totalSpent?.toFixed(5) ?? '0.00000'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: 'var(--dashboard-bg-card)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--dashboard-text-secondary)' }}>Current Level</CardTitle>
            <Button size="sm" style={{ backgroundColor: 'var(--dashboard-blue)' }}>
              Benefits <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--dashboard-blue)' }}>JUNIOR</div>
            <div className="text-sm" style={{ color: 'var(--dashboard-text-secondary)' }}>5%</div>
            <div className="text-xs" style={{ color: 'var(--dashboard-text-muted)' }}>Next Level: FREQUENT</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Create Order */}
        <div className="lg:col-span-2">
          <Card style={{ backgroundColor: 'var(--dashboard-bg-card)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: 'var(--dashboard-text-primary)' }}>
                <Plus className="h-5 w-5" />
                Create order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Type Buttons */}
              <div className="flex gap-2">
                <Button className="flex-1" style={{ backgroundColor: 'var(--dashboard-blue)' }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New order
                </Button>
                <Button variant="outline" className="flex-1" style={{ borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)' }}>
                  <FileStack className="h-4 w-4 mr-2" />
                  Mass order
                </Button>
              </div>

              {/* Service Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--dashboard-text-muted)' }} />
                <Input 
                  placeholder="Search services by name or ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10" 
                  style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)' }} 
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>

              {/* Search Results */}
              {services.length > 0 && (
                <div className="max-h-60 overflow-y-auto border rounded-lg bg-background">
                  {services.map((service) => (
                    <div
                      key={service.service}
                      onClick={() => handleServiceSelect(service)}
                      className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {service.service} - {service.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Rate: ${service.userRate || service.rate} | Min: {service.min} | Max: {service.max}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {service.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Social Media Filters - Auto carousel (marquee) */}
              <div className="marquee-container pb-2">
                <div className="marquee-track">
                  {[...Array(2)].map((_, loopIndex) => (
                    <div key={loopIndex} className="marquee-group inline-flex items-center gap-2 pr-4" aria-hidden={loopIndex === 1}>
                      <Button size="sm" className="whitespace-nowrap" style={{ backgroundColor: 'var(--dashboard-blue)' }}>
                        <Plus className="h-4 w-4 mr-1" />
                        All
                      </Button>
                      {platforms.slice(1).map((platform) => {
                        const IconComponent = platform.icon;
                        return (
                          <Button key={`${platform.name}-${loopIndex}`} size="sm" variant="outline" className="whitespace-nowrap" style={{ borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)' }}>
                            <IconComponent className="h-4 w-4 mr-1" />
                            {platform.name}
                          </Button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Service Display */}
              {selectedService && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium" style={{ color: 'var(--dashboard-text-primary)' }}>Selected Service</Label>
                  <div className="p-3 rounded-lg border bg-muted/50">
                    <div className="font-medium text-sm">
                      {selectedService.service} - {selectedService.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Rate: ${selectedService.userRate || selectedService.rate} | Min: {selectedService.min} | Max: {selectedService.max}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Category: {selectedService.category}
                    </div>
                  </div>
                </div>
              )}

              {/* Link Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: 'var(--dashboard-text-primary)' }}>Link *</Label>
                <Input
                  placeholder="Enter your link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)' }}
                />
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: 'var(--dashboard-text-primary)' }}>
                  Quantity * {selectedService && `(Min: ${selectedService.min}, Max: ${selectedService.max})`}
                </Label>
                <Input
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min={selectedService?.min || 0}
                  max={selectedService?.max || 999999}
                  style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)' }}
                />
              </div>

              {/* Total Charge Display */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: 'var(--dashboard-text-primary)' }}>Total Charge</Label>
                <Input
                  value={`$${totalCharge.toFixed(4)}`}
                  readOnly
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)', fontWeight: '600' }}
                />
              </div>

              {/* Submit Button */}
              <Button 
                className="w-full" 
                style={{ backgroundColor: 'var(--dashboard-blue)', fontSize: '1.125rem', padding: '1.5rem 0' }}
                onClick={handleSubmitOrder}
                disabled={!selectedService || !link.trim() || !quantity.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Placing Order...
                  </>
                ) : (
                  'Submit Order'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Statistics Card */}
          <Card className="border-none rounded-2xl bg-gradient-to-b from-white to-blue-50/40 shadow-sm ring-1 ring-blue-100/70 dark:bg-[linear-gradient(to_bottom,var(--dashboard-blue-dark),var(--dashboard-blue-darker))] dark:ring-0">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Statistics Button */}
                <Button 
                  variant="ghost" 
                  className="w-full h-auto py-3 px-4 justify-between rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 shadow-xs transition-colors dark:bg-white/20 dark:hover:bg-white/30 dark:text-white dark:border-white/20"
                >
                  <span className="inline-flex items-center gap-2">
                    Statistics
                  </span>
                  <ArrowRight className="h-4 w-4 text-blue-400 dark:text-white/70" />
                </Button>
                
                {/* Read Before Ordering Button */}
                <Button 
                  variant="ghost" 
                  className="w-full h-auto py-3 px-4 justify-between rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 shadow-xs transition-colors dark:bg-white/20 dark:hover:bg-white/30 dark:text-white dark:border-white/20"
                >
                  <span className="inline-flex items-center gap-2">
                    Read Before Ordering
                  </span>
                  <ArrowRight className="h-4 w-4 text-blue-400 dark:text-white/70" />
                </Button>
                
                {/* Divider */}
                <div className="border-t border-blue-100 dark:border-white/20 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Username Card */}
                    <div 
                      className="p-3 rounded-xl flex items-center gap-3 bg-blue-50 ring-1 ring-blue-100 hover:shadow-sm transition-transform hover:-translate-y-0.5 dark:bg-[linear-gradient(to_bottom,var(--dashboard-blue-dark),var(--dashboard-blue-darker))] dark:ring-0"
                    >
                      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center ring-1 ring-blue-200 dark:bg-white/10 dark:ring-white/10">
                        <User className="h-4 w-4 text-blue-700 dark:text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-700/70 dark:text-white/70">Username</p>
                        <p className="text-sm font-semibold text-blue-900 dark:text-white">{user?.username || user?.email || 'User'}</p>
                      </div>
                    </div>
                    
                    {/* Discount Rate Card */}
                    <div 
                      className="p-3 rounded-xl flex items-center gap-3 bg-blue-50 ring-1 ring-blue-100 hover:shadow-sm transition-transform hover:-translate-y-0.5 dark:bg-[linear-gradient(to_bottom,var(--dashboard-blue-dark),var(--dashboard-blue-darker))] dark:ring-0"
                    >
                      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center ring-1 ring-blue-200 dark:bg-white/10 dark:ring-white/10">
                        <Percent className="h-4 w-4 text-blue-700 dark:text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-700/70 dark:text-white/70">Discount Rate</p>
                        <p className="text-sm font-semibold text-blue-900 dark:text-white">0%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Orders Card */}
          <Card style={{ backgroundColor: 'var(--dashboard-bg-card)' }}>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8" style={{ color: 'var(--dashboard-green)' }} />
              </div>
              <div className="text-3xl font-bold" style={{ color: 'var(--dashboard-green)' }}>52</div>
              <div className="text-sm" style={{ color: 'var(--dashboard-text-secondary)' }}>Active Orders</div>
            </CardContent>
          </Card>

          {/* Unread Tickets Card */}
          <Card style={{ backgroundColor: 'var(--dashboard-bg-card)' }}>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <MessageSquare className="h-8 w-8" style={{ color: 'var(--dashboard-blue)' }} />
              </div>
              <div className="text-3xl font-bold" style={{ color: 'var(--dashboard-blue)' }}>1</div>
              <div className="text-sm" style={{ color: 'var(--dashboard-text-secondary)' }}>Unread Tickets</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
