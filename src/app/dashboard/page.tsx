'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreateOrderCard from "@/components/dashboard/CreateOrderCard"
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  TrendingUp,
  ArrowRight,
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
  User
} from "lucide-react";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from "@/context/AuthContext";
import { fetchServicesFromApi, fetchServicesGradually, groupServicesByPlatform, type ApiServiceItem } from "./services/service-api";
import { placeNewOrder, type PlaceOrderRequest } from "./order-api";
import { toast } from "sonner";
import { submitMassOrder, parseMassOrderInput, calculateTotalProfit, type MassOrderItem } from "./mass-order/massOrder-api";
import { useDashboardData } from "@/hooks/useDashboardData";

function useDebounced<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export default function Dashboard() {
const { token, user } = useAuth()
const {  loading: dashboardLoading } = useDashboardData()

const balance = user?.balance ?? 0
const totalSpent = user?.totalSpent ?? 0


  const [searchQuery, setSearchQuery] = useState("")
  const [services, setServices] = useState<ApiServiceItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedService, setSelectedService] = useState<ApiServiceItem | null>(null)
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [quantityError, setQuantityError] = useState<string | null>(null)

  // Platforms / mass
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All")
  const [isMassMode, setIsMassMode] = useState(false)
  const [moInput, setMoInput] = useState("")
  const [moOrders, setMoOrders] = useState<MassOrderItem[]>([])
  const [moTotalProfit, setMoTotalProfit] = useState(0)
  const [moIsCalculating, setMoIsCalculating] = useState(false)
  const [moIsSubmitting, setMoIsSubmitting] = useState(false)
  const [moErrors, setMoErrors] = useState<string[]>([])

  const debouncedQuery = useDebounced(searchQuery, 350)
  const servicesCache = useRef<Record<string, ApiServiceItem[]>>({}) 
  const abortRef = useRef<AbortController | null>(null)

  // Dynamic platforms
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

  // ------- Helpers (validation kept compact) -------
  const validateLink = useCallback((value: string) => {
    const v = value.trim()
    if (!v) return setLinkError('Link is required'), false
    try {
      const p = new URL(v)
      if (!['http:', 'https:'].includes(p.protocol)) return setLinkError('Link must be http(s)'), false
    } catch { return setLinkError('Enter a valid URL'), false }
    setLinkError(null)
    return true
  }, [])

  const validateQuantity = useCallback((value: string, svc?: ApiServiceItem | null) => {
    const v = value.trim()
    if (!v) return setQuantityError('Quantity is required'), false
    const n = Number(v)
    if (!Number.isFinite(n) || isNaN(n)) return setQuantityError('Quantity must be a number'), false
    if (svc) {
      if (n < svc.min) return setQuantityError(`Minimum is ${svc.min}`), false
      if (n > svc.max) return setQuantityError(`Maximum is ${svc.max}`), false
    }
    setQuantityError(null)
    return true
  }, [])

  // ------- Fast, cached search -------
  const fetchAndCache = useCallback(async (opts: { query?: string, platform?: string }) => {
    const key = `${opts.platform || 'All'}|${(opts.query || '').trim().toLowerCase()}`
    if (servicesCache.current[key]) return servicesCache.current[key]

    if (!token) return []

    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    setIsSearching(true)
    try {
      // Attempt a gradual fetch with early exit when we've collected enough results
      const limit = 100
      let page = 1
      let all: ApiServiceItem[] = []
      while (page <= 6) {
        const res = await fetchServicesFromApi({ profit: 10, page, limit, token: token || undefined })
        if (ac.signal.aborted) break
        all.push(...res)
        if (res.length < limit) break
        // small early exit: if searching by query and we already have 200 candidates, stop
        if (opts.query && all.length >= 200) break
        page++
      }

      // Basic client-side filtering
      const q = (opts.query || '').trim().toLowerCase()
      const filtered = all.filter(s => {
        if (!q) return true
        return s.name.toLowerCase().includes(q) || s.service.toString() === q || s.category?.toLowerCase().includes(q)
      })

      // If filtering by platform, group and pick that group
      const grouped = groupServicesByPlatform(filtered)
      const out = opts.platform && opts.platform !== 'All' ? (grouped[opts.platform] || []) : filtered

      servicesCache.current[key] = out
      return out
    } catch (err) {
      if ((err as any)?.name === 'AbortError') return []
      console.error('search error', err)
      toast.error('Failed to search services')
      return []
    } finally {
      setIsSearching(false)
    }
  }, [token])

  // Debounced search effect
  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!debouncedQuery.trim()) {
        // If platform selected without query, we want platform services (handled elsewhere)
        if (mounted && selectedPlatform === 'All') {
          setServices([])
          setSelectedService(null)
        }
        return
      }

      const res = await fetchAndCache({ query: debouncedQuery, platform: 'All' })
      if (!mounted) return
      setServices(res.slice(0, 50))
    })()
    return () => { mounted = false }
  }, [debouncedQuery, fetchAndCache, selectedPlatform])

  // Platform loader (only when user clicks platform and no active search)
  const handlePlatformSelect = useCallback(async (platform: string) => {
    setSelectedPlatform(platform)
    setServices([])
    setSelectedService(null)

    if (platform === 'All') return
    if (searchQuery.trim()) return // don't auto-fetch while user actively searching

    const res = await fetchAndCache({ platform })
    setServices(res.slice(0, 50))
    if (res.length === 0) toast.info(`No ${platform} services found. Try another platform.`)
  }, [fetchAndCache, searchQuery])

  // Load dynamic platforms (cached minimal pages)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!token) return
      try {
        const all = await fetchServicesGradually({ profit: 10, maxPages: 3, limit: 100, token: token || undefined })
        if (!mounted) return
        const grouped = groupServicesByPlatform(all)
        const names = Object.keys(grouped).sort()
        const fallback = ['Facebook', 'Instagram', 'YouTube', 'Twitter', 'TikTok', 'Spotify', 'Twitch']
        const final = names.length ? names : fallback
        if (!final.includes('Twitter')) final.push('Twitter')
        setDynamicPlatforms(final)
      } catch (err) {
        if (!mounted) return
        setDynamicPlatforms(['Facebook', 'Instagram', 'YouTube', 'Twitter', 'TikTok', 'Spotify', 'Twitch'])
      }
    })()
    return () => { mounted = false }
  }, [token])

  // Prefill service by query param (keeps original behavior but simplified)
  const searchParams = useSearchParams()
  const router = useRouter()
  useEffect(() => {
    const svcParam = searchParams.get('service')
    if (!svcParam) return
    let cancelled = false
    ;(async () => {
      const id = Number(svcParam)
      if (isNaN(id)) return
      try {
        const all = await fetchServicesGradually({ profit: 10, maxPages: 6, limit: 100, token: token || undefined })
        if (cancelled) return
        const found = all.find(s => s.service === id)
        if (found) {
          setSelectedService(found)
          setSearchQuery(found.name)
          const platform = Object.keys(groupServicesByPlatform([found]))[0] || 'All'
          setSelectedPlatform(platform)
          try {
            const url = new URL(window.location.href)
            url.searchParams.delete('service')
            router.replace(url.pathname + url.search)
          } catch {}
        }
      } catch (err) {
        console.warn('prefill error', err)
      }
    })()
    return () => { cancelled = true }
  }, [searchParams, token, router])

  // Mass order handlers (kept mostly as-is but using helpers)
  const updateMoOrdersAndProfit = useCallback(async (inputValue: string) => {
    if (!token) return
    const parsed = parseMassOrderInput(inputValue)
    setMoOrders(parsed)
    setMoErrors([])
    if (!parsed.length) { setMoTotalProfit(0); return }

    const errs: string[] = []
    parsed.forEach((order, idx) => {
      if (isNaN(order.serviceId) || order.serviceId <= 0) errs.push(`Line ${idx + 1}: Invalid service ID`)
      if (!order.link) errs.push(`Line ${idx + 1}: Link is required`)
      if (isNaN(order.quantity) || order.quantity <= 0) errs.push(`Line ${idx + 1}: Invalid quantity`)
    })
    if (errs.length) { setMoErrors(errs); setMoTotalProfit(0); return }

    setMoIsCalculating(true)
    try {
      const profit = await calculateTotalProfit(parsed, token)
      setMoTotalProfit(profit)
    } catch (err) {
      console.error(err)
      setMoTotalProfit(0)
    } finally { setMoIsCalculating(false) }
  }, [token])

  useEffect(() => {
    const id = setTimeout(() => updateMoOrdersAndProfit(moInput), 350)
    return () => clearTimeout(id)
  }, [moInput, updateMoOrdersAndProfit])

  const handleMoSubmit = useCallback(async () => {
    if (!token) return toast.error('Authentication required')
    if (!moOrders.length) return toast.error('No valid orders to submit')
    if (moErrors.length) return toast.error('Please fix validation errors')
    setMoIsSubmitting(true)
    try {
      const result = await submitMassOrder(moOrders, token)
      if (result.status === 'Success') {
        toast.success('Mass Order Submitted!', { description: result.message })
        setMoInput(''); setMoOrders([]); setMoTotalProfit(0); setMoErrors([])
      } else toast.error('Submission Failed', { description: result.message })
    } catch (err) {
      console.error(err); toast.error('Error', { description: 'An error occurred while submitting the mass order' })
    } finally { setMoIsSubmitting(false) }
  }, [moOrders, moErrors, token])

  // Orders
  const totalCharge = useMemo(() => {
    if (!selectedService || !quantity) return 0
    const qty = parseFloat(quantity)
    if (isNaN(qty)) return 0
    const rate = (selectedService.userRate ?? selectedService.rate)
    // API rates are per 1000 units — convert to per-unit price
    return (rate / 1000) * qty
  }, [selectedService, quantity])

  const handleSubmitOrder = useCallback(async () => {
    if (!selectedService || !link.trim() || !quantity.trim()) return toast.error("Please fill in all required fields")
    if (!token) return toast.error("Authentication required")
    const qty = parseFloat(quantity)
    if (isNaN(qty) || qty < selectedService.min || qty > selectedService.max) return toast.error(`Quantity must be between ${selectedService.min} and ${selectedService.max}`)
    if (!validateLink(link)) return
    setIsSubmitting(true)
    try {
      const orderData: PlaceOrderRequest = { serviceId: selectedService.service, link: link.trim(), profit: selectedService.userRate || selectedService.rate, quantity: qty }
      const result = await placeNewOrder(orderData, token)
      if (result.success) {
        toast.success("Order placed successfully!", { description: `Order ID: ${result.order.apiOrderId}` })
        setSelectedService(null); setSearchQuery(''); setLink(''); setQuantity(''); setServices([])
      } else {
        toast.error("Failed to place order", { description: result.message })
      }
    } catch (err) {
      console.error(err); toast.error("Failed to place order", { description: "Please try again later" })
    } finally { setIsSubmitting(false) }
  }, [selectedService, link, quantity, token, validateLink])

  // UI render (structure preserved, internals simplified)
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card style={{ backgroundColor: 'var(--dashboard-bg-card)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--dashboard-text-secondary)' }}>Current Balance</CardTitle>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--dashboard-green)' }}>
              <Wallet className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? <Skeleton className="h-7 w-32" /> : <div className="text-2xl font-bold" style={{ color: 'var(--dashboard-text-primary)' }}>${balance?.toFixed(5) ?? '0.00000'}</div>}
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
            {dashboardLoading ? <Skeleton className="h-7 w-32" /> : <div className="text-2xl font-bold" style={{ color: 'var(--dashboard-text-primary)' }}>${totalSpent?.toFixed(5) ?? '0.00000'}</div>}
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

      {/* Main grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
        <div className="md:col-span-2 lg:col-span-2">
          <CreateOrderCard
            isMassMode={isMassMode}
            setIsMassMode={setIsMassMode}
            dynamicPlatforms={dynamicPlatforms}
            selectedPlatform={selectedPlatform}
            handlePlatformSelect={handlePlatformSelect}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSearching={isSearching}
            services={services}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            setServices={setServices}

            moInput={moInput}
            setMoInput={setMoInput}
            moErrors={moErrors}
            moIsCalculating={moIsCalculating}
            moOrders={moOrders}
            moTotalProfit={moTotalProfit}
            moIsSubmitting={moIsSubmitting}
            handleMoSubmit={handleMoSubmit}

            link={link}
            setLink={setLink}
            linkError={linkError}
            quantity={quantity}
            setQuantity={setQuantity}
            quantityError={quantityError}
            totalCharge={totalCharge}
            handleSubmitOrder={handleSubmitOrder}
            isSubmitting={isSubmitting}

            validateLink={validateLink}
            validateQuantity={validateQuantity}
          />
        </div>

        {/* Right sidebar (responsive fixes) */}
        <div className="space-y-4 w-full max-w-full">
          <Card className="w-full max-w-full border-none rounded-2xl bg-gradient-to-b from-white to-blue-50/40 shadow-sm ring-1 ring-blue-100/70 dark:bg-[linear-gradient(to_bottom,var(--dashboard-blue-dark),var(--dashboard-blue-darker))] dark:ring-0">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <Button variant="ghost" className="w-full h-auto py-3 px-4 justify-between rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 shadow-xs transition-colors dark:bg-white/20 dark:hover:bg-white/30 dark:text-white dark:border-white/20"><span className="inline-flex items-center gap-2">Statistics</span><ArrowRight className="h-4 w-4 text-blue-400 dark:text-white/70" /></Button>
                <Button variant="ghost" className="w-full h-auto py-3 px-4 justify-between rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 shadow-xs transition-colors dark:bg-white/20 dark:hover:bg-white/30 dark:text-white dark:border-white/20"><span className="inline-flex items-center gap-2">Read Before Ordering</span><ArrowRight className="h-4 w-4 text-blue-400 dark:text-white/70" /></Button>
                <div className="border-t border-blue-100 dark:border-white/20 pt-4"><div className="grid grid-cols-2 gap-3"><div className="p-3 rounded-xl flex items-center gap-3 bg-blue-50 ring-1 ring-blue-100 hover:shadow-sm transition-transform hover:-translate-y-0.5 dark:bg-[linear-gradient(to_bottom,var(--dashboard-blue-dark),var(--dashboard-blue-darker))] dark:ring-0"><div className="h-8 w-8 rounded-full bg-white flex items-center justify-center ring-1 ring-blue-200 dark:bg-white/10 dark:ring-white/10"><User className="h-4 w-4 text-blue-700 dark:text-white" /></div><div><p className="text-xs text-blue-700/70 dark:text-white/70">Username</p><p className="text-sm font-semibold text-blue-900 dark:text-white">{user?.username || user?.email || 'User'}</p></div></div><div className="p-3 rounded-xl flex items-center gap-3 bg-blue-50 ring-1 ring-blue-100 hover:shadow-sm transition-transform hover:-translate-y-0.5 dark:bg-[linear-gradient(to_bottom,var(--dashboard-blue-dark),var(--dashboard-blue-darker))] dark:ring-0"><div className="h-8 w-8 rounded-full bg-white flex items-center justify-center ring-1 ring-blue-200 dark:bg-white/10 dark:ring-white/10"><Percent className="h-4 w-4 text-blue-700 dark:text-white" /></div><div><p className="text-xs text-blue-700/70 dark:text-white/70">Discount Rate</p><p className="text-sm font-semibold text-blue-900 dark:text-white">0%</p></div></div></div></div>
              </div>
            </CardContent>
          </Card>

      <div className="flex xl:flex-row flex-col">
            <Card style={{ backgroundColor: 'var(--dashboard-bg-card)' }}><CardContent className="p-6 text-center"><div className="flex items-center justify-center mb-2"><CheckCircle className="h-8 w-8" style={{ color: 'var(--dashboard-green)' }} /></div><div className="text-3xl font-bold" style={{ color: 'var(--dashboard-green)' }}>52</div><div className="text-sm" style={{ color: 'var(--dashboard-text-secondary)' }}>Active Orders</div></CardContent></Card>

          <Card style={{ backgroundColor: 'var(--dashboard-bg-card)' }}><CardContent className="p-6 text-center"><div className="flex items-center justify-center mb-2"><MessageSquare className="h-8 w-8" style={{ color: 'var(--dashboard-blue)' }} /></div><div className="text-3xl font-bold" style={{ color: 'var(--dashboard-blue)' }}>1</div><div className="text-sm" style={{ color: 'var(--dashboard-text-secondary)' }}>Unread Tickets</div></CardContent></Card>
      </div>
        </div>
      </div>
    </div>
  )
}
