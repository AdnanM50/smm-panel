'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Info,
  AlertCircle,
  Filter,
} from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from "@/context/AuthContext";
import { fetchServicesFromApi, fetchServicesGradually, groupServicesByPlatform, type ApiServiceItem } from "./services/service-api";
import { placeNewOrder, type PlaceOrderRequest } from "./order-api";
import { toast } from "sonner";
import { submitMassOrder, parseMassOrderInput, calculateTotalProfit, type MassOrderItem } from "./mass-order/massOrder-api";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function Dashboard() {
  const { token, user, validateToken } = useAuth()
  const { balance, totalSpent, isLoading: dashboardLoading, error: dashboardError } = useDashboardData()
  
  // Service search and order form states
  const [searchQuery, setSearchQuery] = useState("")
  const [services, setServices] = useState<ApiServiceItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedService, setSelectedService] = useState<ApiServiceItem | null>(null)
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Inline validation errors
  const [linkError, setLinkError] = useState<string | null>(null)
  const [quantityError, setQuantityError] = useState<string | null>(null)

  // Validation helpers
  const validateLink = (value: string) => {
    const v = value.trim()
    if (!v) {
      setLinkError('Link is required')
      return false
    }
    try {
      const parsed = new URL(v)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setLinkError('Link must be http(s)')
        return false
      }
    } catch (e) {
      setLinkError('Enter a valid URL')
      return false
    }
    setLinkError(null)
    return true
  }

  const validateQuantity = (value: string) => {
    const v = value.trim()
    if (!v) {
      setQuantityError('Quantity is required')
      return false
    }
    const n = Number(v)
    if (!Number.isFinite(n) || isNaN(n)) {
      setQuantityError('Quantity must be a number')
      return false
    }
    if (selectedService) {
      if (n < selectedService.min) {
        setQuantityError(`Minimum is ${selectedService.min}`)
        return false
      }
      if (n > selectedService.max) {
        setQuantityError(`Maximum is ${selectedService.max}`)
        return false
      }
    }
    setQuantityError(null)
    return true
  }

  useEffect(() => {
    // re-validate quantity when selected service changes
    if (selectedService && quantity) {
      validateQuantity(quantity)
    } else {
      setQuantityError(null)
    }
  }, [selectedService])
  // Platform filtering state
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All")
  // Mass order mode state
  const [isMassMode, setIsMassMode] = useState(false)
  const [moInput, setMoInput] = useState("")
  const [moOrders, setMoOrders] = useState<MassOrderItem[]>([])
  const [moTotalProfit, setMoTotalProfit] = useState(0)
  const [moIsCalculating, setMoIsCalculating] = useState(false)
  const [moIsSubmitting, setMoIsSubmitting] = useState(false)
  const [moErrors, setMoErrors] = useState<string[]>([])

  // Service search functionality
  const searchServices = useCallback(async (query: string, platformFilter?: string) => {
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
          token: token || undefined,
        })
        
        allServices = [...allServices, ...pageServices]
        hasMorePages = pageServices.length === limit
        page++
      }

      // Filter services based on search query
      let filteredServices = allServices.filter(service => {
        const queryLower = query.toLowerCase()
        return (
          service.name.toLowerCase().includes(queryLower) ||
          service.service.toString().includes(query) ||
          service.category?.toLowerCase().includes(queryLower)
        )
      })

      // When searching, show all matching results regardless of platform filter
      // This allows users to search for anything even when a platform is selected
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
        searchServices(searchQuery) // Don't pass platform filter when searching
      } else {
        setServices([])
        setSelectedService(null)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchServices])

  // Populate dynamic platform list for the create-order badges without changing UI design
  useEffect(() => {
    let cancelled = false

    ;(async () => {
      if (!token) return
      try {
        // Fetch a few pages to gather representative services and infer groups
        let all: ApiServiceItem[] = []
        let page = 1
        const limit = 100
        while (page <= 3) {
          const pageSvcs = await fetchServicesFromApi({ profit: 10, page, limit, token: token || undefined })
          if (!pageSvcs || pageSvcs.length === 0) break
          all = all.concat(pageSvcs)
          if (pageSvcs.length < limit) break
          page++
        }

        if (cancelled) return
        const grouped = groupServicesByPlatform(all)
        const names = Object.keys(grouped).sort()
        
        // Fallback platforms if API doesn't return any
        const fallbackPlatforms = ['Facebook', 'Instagram', 'YouTube', 'Twitter', 'TikTok', 'Spotify', 'Twitch']
        
        // Use API platforms if available, otherwise use fallback
        const finalPlatforms = names.length > 0 ? names : fallbackPlatforms
        
        // Ensure Twitter is included in the platform list
        const platformsWithTwitter = finalPlatforms.includes('Twitter') ? finalPlatforms : [...finalPlatforms, 'Twitter']
        setDynamicPlatforms(platformsWithTwitter)
        
        console.log('Platforms loaded:', platformsWithTwitter)
      } catch (err) {
        // Silent fail - keep design unchanged
        console.warn('Failed to load dynamic platforms for dashboard', err)
        // Set fallback platforms if API fails
        if (!cancelled) {
          const fallbackPlatforms = ['Facebook', 'Instagram', 'YouTube', 'Twitter', 'TikTok', 'Spotify', 'Twitch']
          setDynamicPlatforms(fallbackPlatforms)
          console.log('Using fallback platforms:', fallbackPlatforms)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token])

  // Mass order: parse input and calculate profit in real-time
  const updateMoOrdersAndProfit = useCallback(async (inputValue: string) => {
    if (!token) return

    const parsedOrders = parseMassOrderInput(inputValue)
    setMoOrders(parsedOrders)
    setMoErrors([])

    if (parsedOrders.length === 0) {
      setMoTotalProfit(0)
      return
    }

    const validationErrors: string[] = []
    parsedOrders.forEach((order, index) => {
      if (isNaN(order.serviceId) || order.serviceId <= 0) {
        validationErrors.push(`Line ${index + 1}: Invalid service ID`)
      }
      if (!order.link || order.link.length === 0) {
        validationErrors.push(`Line ${index + 1}: Link is required`)
      }
      if (isNaN(order.quantity) || order.quantity <= 0) {
        validationErrors.push(`Line ${index + 1}: Invalid quantity`)
      }
    })

    if (validationErrors.length > 0) {
      setMoErrors(validationErrors)
      setMoTotalProfit(0)
      return
    }

    setMoIsCalculating(true)
    try {
      const profit = await calculateTotalProfit(parsedOrders, token)
      setMoTotalProfit(profit)
    } catch (error) {
      console.error('Profit calculation error (mass):', error)
      setMoTotalProfit(0)
    } finally {
      setMoIsCalculating(false)
    }
  }, [token])

  useEffect(() => {
    const timer = setTimeout(() => {
      updateMoOrdersAndProfit(moInput)
    }, 500)

    return () => clearTimeout(timer)
  }, [moInput, updateMoOrdersAndProfit])

  const handleMoSubmit = async () => {
    if (!token) {
      toast.error('Authentication required')
      return
    }

    if (moOrders.length === 0) {
      toast.error('No valid orders to submit')
      return
    }

    if (moErrors.length > 0) {
      toast.error('Please fix validation errors before submitting')
      return
    }

    setMoIsSubmitting(true)
    try {
      const result = await submitMassOrder(moOrders, token)
      if (result.status === 'Success') {
        toast.success('Mass Order Submitted!', { description: result.message })
        setMoInput('')
        setMoOrders([])
        setMoTotalProfit(0)
        setMoErrors([])
      } else {
        toast.error('Submission Failed', { description: result.message })
      }
    } catch (error) {
      console.error('Mass submit error:', error)
      toast.error('Error', { description: 'An error occurred while submitting the mass order' })
    } finally {
      setMoIsSubmitting(false)
    }
  }

  // Handle service selection
  const handleServiceSelect = (service: ApiServiceItem) => {
    setSelectedService(service)
    setSearchQuery(service.name)
    setServices([])
    // Reset quantity and validate against new service limits
    setQuantity('')
    setQuantityError(null)
  }

  // Pre-fill when arriving from services list: ?service=<id>
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const svcParam = searchParams.get('service')
    if (!svcParam) return

    let cancelled = false
    ;(async () => {
      const id = Number(svcParam)
      if (isNaN(id)) return

      // Try to find the service by fetching a few pages gradually
      try {
        const all = await fetchServicesGradually({ profit: 10, maxPages: 6, limit: 100, token: token || undefined })
        if (cancelled) return
        const found = all.find((s) => s.service === id)
        if (found) {
          setSelectedService(found)
          setSearchQuery(found.name)
          // infer platform and set selectedPlatform for UI clarity
          const grouped = groupServicesByPlatform([found])
          const platform = Object.keys(grouped)[0] || 'All'
          setSelectedPlatform(platform)

          // remove the param from URL to avoid re-running this effect repeatedly
          try {
            const url = new URL(window.location.href)
            url.searchParams.delete('service')
            router.replace(url.pathname + url.search)
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        console.warn('Failed to prefill service from query param', err)
      }
    })()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, token])

  // Handle platform selection
  const handlePlatformSelect = async (platform: string) => {
    setSelectedPlatform(platform)
    
    if (platform === "All") {
      setServices([])
      setSearchQuery("")
      return
    }
    
    // Only auto-fetch platform services if no search query is active
    if (!searchQuery.trim()) {
      // Auto-fetch services for the selected platform
      setIsSearching(true)
      try {
        // Fetch services and filter by platform
        let allServices: ApiServiceItem[] = []
        let page = 1
        const limit = 100
        let hasMorePages = true

        // Fetch more pages to ensure we get platform services
        while (hasMorePages && page <= 10) { // Increased to 10 pages
          const pageServices = await fetchServicesFromApi({
            profit: 10,
            page,
            limit,
            token: token || undefined,
          })
          
          allServices = [...allServices, ...pageServices]
          hasMorePages = pageServices.length === limit
          page++
        }

        console.log(`Fetched ${allServices.length} total services for platform: ${platform}`)

        // Filter services by platform
        const grouped = groupServicesByPlatform(allServices)
        console.log('Available platforms:', Object.keys(grouped))
        console.log(`${platform} services:`, grouped[platform]?.length || 0)
        
        const platformServices = grouped[platform] || []
        
        setServices(platformServices.slice(0, 50)) // Limit to 50 results
        
        if (platformServices.length === 0) {
          console.warn(`No services found for platform: ${platform}`)
          toast.info(`No ${platform} services found. Try selecting a different platform.`)
        }
      } catch (error) {
        console.error('Error fetching platform services:', error)
        toast.error("Failed to load services")
      } finally {
        setIsSearching(false)
      }
    }
  }

  // Get platform-specific search placeholder
  const getSearchPlaceholder = () => {
    if (selectedPlatform === "All") {
      return "Search services by name or ID..."
    }
    return `Search ${selectedPlatform} services by name or ID... (or search anything)`
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

    // Final link validation before submit
    try {
      const parsed = new URL(link.trim())
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        toast.error('Link must be a valid http(s) URL')
        return
      }
    } catch (e) {
      toast.error('Link must be a valid URL')
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

  // dynamic platforms will be populated from API data; keep a small icon map for known platforms
  const [dynamicPlatforms, setDynamicPlatforms] = useState<string[]>([])

  const iconMap: Record<string, any> = {
    Telegram: Send,
    Twitter: Twitter,
    Discord: MessageSquare,
    SoundCloud: Music2,
    LinkedIn: Linkedin,
    YouTube: Youtube,
    Facebook: Facebook,
    Instagram: Instagram,
  }

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
            {dashboardLoading ? (
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
            {dashboardLoading ? (
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

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
        {/* Create Order */}
        <div className="md:col-span-2 lg:col-span-2">
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
                <Button
                  variant={isMassMode ? 'outline' : 'default'}
                  className="flex-1"
                  style={{
                    borderColor: isMassMode ? 'var(--border)' : undefined,
                    backgroundColor: isMassMode ? 'var(--input)' : 'var(--dashboard-blue)',
                    color: isMassMode ? 'var(--dashboard-text-primary)' : undefined,
                  }}
                  onClick={() => setIsMassMode(false)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New order
                </Button>
                <Button
                  variant={isMassMode ? 'default' : 'outline'}
                  className="flex-1"
                  style={{ borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)' }}
                  onClick={() => setIsMassMode(prev => !prev)}
                >
                  <FileStack className="h-4 w-4 mr-2" />
                  Mass order
                </Button>
              </div>
  {/* Social Media Filters - Auto carousel (marquee) */}
              <div className="marquee-container pb-2">
                <div className="marquee-track">
                  {[...Array(2)].map((_, loopIndex) => (
                    <div key={loopIndex} className="marquee-group inline-flex items-center gap-2 pr-4" aria-hidden={loopIndex === 1}>
                      {/* Render the 'All' button only in the first group to avoid duplicate 'All' pills while keeping the marquee duplication for smooth scrolling */}
                      {/* If platforms haven't loaded yet (initial login), show skeleton pills instead of the real buttons */}
                      {dynamicPlatforms.length === 0 ? (
                        <>
                          {/* Improved skeleton pills: three rounded placeholders with varied widths for a more natural placeholder look */}
                          <div className="inline-flex items-center gap-2" aria-hidden={loopIndex === 1}>
                            <Skeleton className="h-8 w-14 rounded-full" />
                            <Skeleton className="h-8 w-10 rounded-full" />
                            <Skeleton className="h-8 w-20 rounded-full" />
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Render the 'All' pill in both duplicated groups so the marquee never shows a gap.
                              The second copy is marked aria-hidden to avoid duplicate spoken content for screen readers. */}
                          <Button
                            size="sm"
                            className="whitespace-nowrap"
                            style={{
                              backgroundColor: selectedPlatform === 'All' ? 'var(--dashboard-blue)' : 'var(--input)',
                              color: selectedPlatform === 'All' ? 'white' : 'var(--dashboard-text-primary)'
                            }}
                            onClick={() => handlePlatformSelect('All')}
                            aria-hidden={loopIndex === 1}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            All
                          </Button>

                          {dynamicPlatforms.map((name) => {
                            const IconComponent = iconMap[name] || Plus
                            const isSelected = selectedPlatform === name
                            return (
                              <Button
                                key={`${name}-${loopIndex}`}
                                size="sm"
                                variant="outline"
                                className="whitespace-nowrap"
                                style={{
                                  backgroundColor: isSelected ? 'var(--dashboard-blue)' : 'var(--input)',
                                  borderColor: isSelected ? 'var(--dashboard-blue)' : 'var(--border)',
                                  color: isSelected ? 'white' : 'var(--dashboard-text-primary)'
                                }}
                                onClick={() => handlePlatformSelect(name)}
                              >
                                <IconComponent className="h-4 w-4 mr-1" />
                                {name}
                              </Button>
                            )
                          })}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* If mass mode is active, show a single textarea for mass orders */}
              {isMassMode ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <label className="text-lg font-semibold text-foreground">Mass orders (one per line)</label>
                    <Info className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Textarea
                    placeholder="service_id | link | quantity\n4084 | https://web.telegram.org/a/#8092633438 | 10\n2199 | https://example.com | 5"
                    value={moInput}
                    onChange={(e) => setMoInput(e.target.value)}
                    className="min-h-[220px] bg-background border-border font-mono text-sm hover:border-primary/50 transition-colors"
                  />

                  {/* Validation Errors */}
                  {moErrors.length > 0 && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800 mt-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">Validation Errors:</p>
                          <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                            {moErrors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">Estimated profit: {moIsCalculating ? 'Calculating...' : `$${moTotalProfit.toFixed(4)}`}</div>
                      <div className="text-xs text-muted-foreground">{moOrders.length} order{moOrders.length !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="w-48">
                      <Button
                        className="w-full"
                        onClick={handleMoSubmit}
                        disabled={moIsSubmitting || moOrders.length === 0 || moErrors.length > 0}
                        style={{ backgroundColor: 'var(--dashboard-blue)' }}
                      >
                        {moIsSubmitting ? 'Submitting...' : `Submit Mass Order (${moOrders.length})`}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Service Search Bar - Always visible */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--dashboard-text-muted)' }} />
                    <Input 
                      placeholder={getSearchPlaceholder()} 
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

                  {/* Platform Services List - Show when platform is selected
                      Behavior change: hide this entire block when the search input is empty (user requested).
                      If a specific service is selected, show only that service entry. */}
                  {selectedPlatform !== "All" && (searchQuery.trim() !== '' || selectedService || isSearching || services.length > 0) && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--dashboard-text-primary)' }}>
                          {selectedPlatform} Services
                        </h3>
                        {/* Removed inline 'Loading...' label and spinner to declutter the header; keep skeletons in the list below for loading feedback. */}
                      </div>
                      <div className="max-h-80 overflow-y-auto border rounded-lg bg-background">
                        {(() => {
                          if (selectedService) {
                            return (
                              <div
                                key={selectedService.service}
                                onClick={() => handleServiceSelect(selectedService)}
                                className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">
                                      {selectedService.service} - {selectedService.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Rate: ${selectedService.userRate || selectedService.rate} | Min: {selectedService.min} | Max: {selectedService.max}
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {selectedService.category}
                                  </div>
                                </div>
                              </div>
                            )
                          }

                          if (isSearching) {
                            return (
                              <div className="space-y-2 p-2">
                                {[...Array(5)].map((_, index) => (
                                  <div key={index} className="p-3 border-b last:border-b-0">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                      </div>
                                      <Skeleton className="h-3 w-16" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )
                          }

                          if (services.length > 0) {
                            return services.map((service) => (
                              <div
                                key={service.service}
                                onClick={() => handleServiceSelect(service)}
                                className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0 transition-colors"
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
                            ))
                          }

                          return (
                            <div className="p-6 text-center text-muted-foreground">
                              No {selectedPlatform} services found
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Search Results - Only show when All is selected and searching */}
                  {selectedPlatform === "All" && services.length > 0 && (
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

                  {/* Link Input */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium" style={{ color: 'var(--dashboard-text-primary)' }}>Link *</Label>
                    <Input
                      placeholder="Enter your link"
                      value={link}
                      onChange={(e) => {
                        const v = e.target.value
                        setLink(v)
                        validateLink(v)
                      }}
                      onBlur={() => validateLink(link)}
                      style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)' }}
                    />
                    {linkError && <div className="text-sm text-red-500 mt-2">{linkError}</div>}
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
                      onChange={(e) => {
                        const v = e.target.value
                        setQuantity(v)
                        validateQuantity(v)
                      }}
                      onBlur={() => validateQuantity(quantity)}
                      min={selectedService?.min || 0}
                      max={selectedService?.max || 999999}
                      style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)' }}
                    />
                    {quantityError && <div className="text-sm text-red-500 mt-2">{quantityError}</div>}
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
                    disabled={!selectedService || !link.trim() || !quantity.trim() || !!linkError || !!quantityError || isSubmitting}
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
                </>
              )}

            

              {/* single-order controls are rendered above (no duplicate here) */}
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
