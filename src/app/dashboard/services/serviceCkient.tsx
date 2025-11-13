"use client"
import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from 'next/navigation'
import useDebounce from "@/hooks/useDebounce"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Eye, ShoppingCart, Copy, Check } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { fetchServicesFromApi, groupServicesByPlatform, type ApiServiceItem } from "./service-api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toster"

interface Props {
  initialServices?: ApiServiceItem[]
}

export default function ServicesClient({ initialServices = [] }: Props) {
  const { token, validateToken } = useAuth()
  const router = useRouter()

  const [allServices, setAllServices] = useState<ApiServiceItem[]>(initialServices)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [activePlatform, setActivePlatform] = useState<string>("All")

  // Search state
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<ApiServiceItem[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  // Dialog for showing service details on "Review"
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ApiServiceItem | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  

  // Refresh (client-side)
  const fetchServices = async (force = false) => {
    if (isLoading) return

    // Validate token before making API calls
    if (token && !(await validateToken())) {
      setError('Authentication expired. Please login again.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const services = await fetchServicesFromApi({
        profit: 10,
        token: token ?? undefined,
      })

      setAllServices(services)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch services")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      if (!initialServices || initialServices.length === 0) fetchServices()
    }
  }, [token])

  const debouncedQuery = useDebounce(query, 300)

  const openReview = (svc: ApiServiceItem) => {
    setSelectedService(svc)
    setIsDialogOpen(true)
  }

  const copyId = async (id: number | string) => {
    try {
      await navigator.clipboard.writeText(String(id))
      setCopied(true)
      toast({ title: "Copied", description: `Service ID ${id} copied to clipboard.` })
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      toast({ title: "Copy failed", description: "Could not copy to clipboard.", variant: "destructive" })
    }
  }

  useEffect(() => {
    const q = debouncedQuery.trim()
    if (!q) {
      setIsSearching(false)
      setIsSearchLoading(false)
      setSearchResults([])
      return
    }

    let cancelled = false
    const controller = new AbortController()

    setIsSearching(true)
    setIsSearchLoading(true)
    setSearchResults([])

    ;(async () => {
      // Validate token before making API calls
      if (token && !(await validateToken())) {
        if (!cancelled) {
          setError('Authentication expired. Please login again.')
          setIsSearching(false)
          setIsSearchLoading(false)
        }
        return
      }
      const maxPages = 30
      const pageSize = 100
      const batchSize = 8
      const maxResults = 200

      let page = 1
      const isIdSearch = /^\d+$/.test(q)

      try {
        const foundMap = new Map<number, ApiServiceItem>()

        while (page <= maxPages && !cancelled) {
          const pages = Array.from({ length: Math.min(batchSize, maxPages - page + 1) }, (_, i) => page + i)

          const results = await Promise.all(
            pages.map((p) =>
              fetchServicesFromApi({ profit: 10, page: p, limit: pageSize, token: token ?? undefined, signal: controller.signal }).catch(() => [])
            )
          )

          const flat = results.flat()
          const qLower = q.toLowerCase()

          for (const s of flat) {
            if (!s) continue
            const matches = String(s.service).includes(q) || s.name.toLowerCase().includes(qLower) || (s.category || '').toLowerCase().includes(qLower)
            if (matches) {
              foundMap.set(s.service, s)
              if (foundMap.size >= maxResults) break
            }
          }

          if (isIdSearch && foundMap.has(Number(q))) break
          if (foundMap.size >= maxResults) break

          if (results.some((arr) => (arr as ApiServiceItem[]).length < pageSize)) {
            break
          }

          page += pages.length
        }

        if (!cancelled) setSearchResults(Array.from(new Map(foundMap).values()))
      } catch (err) {
        if (!cancelled) {
          console.error('Search error:', err)
          setSearchResults([])
        }
      } finally {
        if (!cancelled) setIsSearchLoading(false)
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [debouncedQuery, token, validateToken])

  const filtered = useMemo(() => {
    const raw = query.trim()
    if (!raw) return allServices

    const qId = raw.replace(/^#/, "").trim()
    const qLower = raw.toLowerCase()

    return allServices.filter((s) => {
      const idStr = String(s.service)
      const nameLower = s.name.toLowerCase()
      const categoryLower = (s.category || "").toLowerCase()

      const matchesId = idStr === qId || idStr.includes(qId)
      const matchesText = nameLower.includes(qLower) || categoryLower.includes(qLower)
      return matchesId || matchesText
    })
  }, [allServices, query])

  const grouped = useMemo(() => groupServicesByPlatform(filtered), [filtered])
  const groupNames = useMemo(() => Object.keys(grouped).sort(), [grouped])

  
  // const allPlatforms = [
  //   "Facebook",
  //   "Instagram",
  //   "Spotify",
  //   "TikTok",
  //   "Twitch",
  //   "Twitter",
  //   "YouTube",
  //   "SoundCloud",
  //   "LinkedIn",
  // ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Services</h1>
          <p className="text-muted-foreground mt-1">Browse and order our services</p>
        </div>
      </div>

      <Card className="p-6 bg-gradient-card border-border">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Service"
                className="pl-10 bg-background border-border"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div>
              <Select value={activePlatform} onValueChange={(v) => setActivePlatform(v)}>
                <SelectTrigger size="sm" className="w-36">
                  <SelectValue>{activePlatform}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {groupNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
        </div>


        {(isLoading && !isSearching) && (
          <div>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-28" />
            </div>

            {[...Array(3)].map((_, i) => (
              <div key={i} className="mb-8">
                <div className="mb-6">
                  <Skeleton className="h-8 w-48" />
                </div>
                <div className="rounded-lg border border-border overflow-hidden p-4">
                  <div className="space-y-3">
                    {[...Array(6)].map((_, r) => <Skeleton key={r} className="h-10 w-full" />)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isSearching && (
          <div>
            {isSearchLoading ? (
              <div className="mb-4 text-sm text-muted-foreground">Searching...</div>
            ) : (
              <div className="mb-8">
                <div className="mb-6">
                  <Badge className="bg-gradient-primary text-primary-foreground text-base px-4 py-2">
                    Search Results ({searchResults.length})
                  </Badge>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12">Favorite</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Rate per 1000</TableHead>
                        <TableHead>Min order - Max order</TableHead>
                        <TableHead>Service Detail</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((service) => (
                        <TableRow key={`search-${service.service}`} className="hover:bg-muted/50 items-center">
                          <TableCell className="whitespace-nowrap">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="text-muted-foreground">☆</span>
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">{service.service}</TableCell>
                          <TableCell className="max-w-[48ch]">
                            <div className="flex items-center gap-3">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="font-medium truncate max-w-[44ch]">{service.name}</p>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs break-words">{service.name}</TooltipContent>
                              </Tooltip>
                              {service.type && service.type.toLowerCase() !== 'default' && (
                                <p className="text-sm text-muted-foreground whitespace-nowrap">Type: {service.type}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold whitespace-nowrap">{service.userRate != null ? `$${service.userRate.toFixed(4)}` : ''}</TableCell>
                          <TableCell className="whitespace-nowrap">{service.min} - {service.max}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Button variant="outline" size="sm" onClick={() => openReview(service)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Review
                            </Button>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <Button className="bg-gradient-primary" size="sm" onClick={() => router.push(`/dashboard?service=${service.service}`)}>
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Buy
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {searchResults.length === 0 && <div className="p-6 text-sm text-muted-foreground">No results found</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

  {!isLoading && !error && query.trim() === "" &&
    // When activePlatform is 'All' show all groups; otherwise only show the selected group
    groupNames.filter((g) => activePlatform === 'All' || g.toLowerCase() === activePlatform.toLowerCase()).map((group) => {
      const services = grouped[group]
      return (
        <div key={group} className="mb-8">
              <div className="mb-6">
                <Badge className="bg-gradient-primary text-primary-foreground text-base px-4 py-2">
                  {group}
                </Badge>
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">Favorite</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Rate per 1000</TableHead>
                      <TableHead>Min order - Max order</TableHead>
                      <TableHead>Service Detail</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.service} className="hover:bg-muted/50 items-center">
                        <TableCell className="whitespace-nowrap">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="text-muted-foreground">☆</span>
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{service.service}</TableCell>
                        <TableCell className="max-w-[48ch]">
                          <div className="flex items-center gap-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="font-medium truncate max-w-[44ch]">{service.name}</p>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs break-words">{service.name}</TooltipContent>
                            </Tooltip>
                            {service.type && service.type.toLowerCase() !== 'default' && (
                              <p className="text-sm text-muted-foreground whitespace-nowrap">Type: {service.type}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold whitespace-nowrap">{service.userRate != null ? `$${service.userRate.toFixed(4)}` : ''}</TableCell>
                        <TableCell className="whitespace-nowrap">{service.min} - {service.max}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Button variant="outline" size="sm" onClick={() => openReview(service)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Review
                          </Button>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button className="bg-gradient-primary" size="sm" onClick={() => router.push(`/dashboard?service=${service.service}`)}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Buy
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )
        })}
        {/* Pagination intentionally removed */}
        {/* Review dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setSelectedService(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Service Details</DialogTitle>
              <DialogDescription>
                {selectedService ? `ID: ${selectedService.service}` : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 mt-4">
              {selectedService ? (
                <div className="grid gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground">ID</div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{selectedService.service}</div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyId(selectedService.service)} aria-label="Copy service id">
                        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Name</div>
                    <div className="font-medium">{selectedService.name}</div>

                    <div className="text-muted-foreground">Category</div>
                    <div className="font-medium">{selectedService.category || "-"}</div>

                    <div className="text-muted-foreground">Type</div>
                    <div className="font-medium">{selectedService.type || "Default"}</div>

                    {selectedService.userRate != null && (
                      <>
                        <div className="text-muted-foreground">Rate (per 1000)</div>
                        <div className="font-medium">${selectedService.userRate.toFixed(4)}</div>
                      </>
                    )}

                    <div className="text-muted-foreground">Min - Max</div>
                    <div className="font-medium">{selectedService.min} - {selectedService.max}</div>

                    <div className="text-muted-foreground">Flags</div>
                    <div className="font-medium">{selectedService.dripped ? 'Drip' : ''} {selectedService.refill ? ' Refill' : ''} {selectedService.cancel ? ' Cancel' : ''}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No service selected</div>
              )}
            </div>

            <DialogFooter>
              <DialogClose>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <div>
                <Button className="bg-gradient-primary" onClick={() => {
                  if (selectedService) router.push(`/dashboard?service=${selectedService.service}`)
                }}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Buy
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}
