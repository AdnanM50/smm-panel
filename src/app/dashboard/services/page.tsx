"use client"
import { useEffect, useMemo, useState } from "react"
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
import { Search, Filter, Eye, ShoppingCart, RefreshCw } from "lucide-react"
import { fetchServicesFromApi, groupServicesByPlatform, type ApiServiceItem } from "./service-api"
import { useAuth } from "@/context/AuthContext"

export default function Services() {
  const { token } = useAuth()
  const [allServices, setAllServices] = useState<ApiServiceItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [lastPage, setLastPage] = useState<number | null>(null)

  // Search state
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<ApiServiceItem[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [searchScannedPages, setSearchScannedPages] = useState(0)

  const fetchServices = async (force = false) => {
    if (isLoading) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const services = await fetchServicesFromApi({
        profit: 10,
        page: currentPage,
        limit,
        token: token ?? undefined,
      })

      setAllServices(services)
      // If fewer than limit returned, we've reached the last page
      if (services.length < limit) {
        setLastPage(currentPage)
      } else if (lastPage && currentPage < lastPage) {
        // keep lastPage if already known
        setLastPage(lastPage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services')
    } finally {
      setIsLoading(false)
    }
  }

  const goToPage = async (nextPage: number) => {
    if (nextPage < 1 || isLoading) return
    setCurrentPage(nextPage)
  }

  useEffect(() => {
    if (token) {
      fetchServices()
    }
  }, [token, currentPage])

  // Debounced global search across pages using cached fetches
  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setIsSearching(false)
      setIsSearchLoading(false)
      setSearchResults([])
      setSearchScannedPages(0)
      return
    }

    let cancelled = false
    setIsSearching(true)
    setIsSearchLoading(true)
    setSearchResults([])
    setSearchScannedPages(0)

    const timer = setTimeout(async () => {
      const maxPages = 100
      const pageSize = 100
      const concurrency = 5
      const pages = Array.from({ length: maxPages }, (_, i) => i + 1)

      // Process in chunks to avoid stressing device/network
      for (let i = 0; i < pages.length && !cancelled; i += concurrency) {
        const chunk = pages.slice(i, i + concurrency)
        const chunkData = await Promise.all(
          chunk.map((p) =>
            fetchServicesFromApi({ profit: 10, page: p, limit: pageSize, token: token ?? undefined })
              .catch(() => [])
          )
        )

        if (cancelled) break
        const flat = chunkData.flat()
        const qLower = q.toLowerCase()
        const filtered = flat.filter((s) =>
          String(s.service).includes(q) || s.name.toLowerCase().includes(qLower)
        )

        setSearchResults((prev) => [...prev, ...filtered])
        setSearchScannedPages((prev) => prev + chunk.length)

        // Stop early if this chunk returned less than full page size for any page
        if (chunkData.some((arr) => (arr as ApiServiceItem[]).length < pageSize)) {
          break
        }
      }

      if (!cancelled) setIsSearchLoading(false)
    }, 400) // debounce

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, token])

  const filtered = useMemo(() => {
    const raw = query.trim()
    if (!raw) return allServices

    // Normalize query for id search: allow "#4040" or "4040"
    const qId = raw.replace(/^#/,'').trim()
    const qLower = raw.toLowerCase()

    return allServices.filter((s) => {
      const idStr = String(s.service)
      const nameLower = s.name.toLowerCase()
      const categoryLower = (s.category || '').toLowerCase()

      // Exact ID match or partial ID includes
      const matchesId = idStr === qId || idStr.includes(qId)
      // Name/category substring match
      const matchesText = nameLower.includes(qLower) || categoryLower.includes(qLower)
      return matchesId || matchesText
    })
  }, [allServices, query])

  const grouped = useMemo(() => groupServicesByPlatform(filtered), [filtered])
  const groupNames = useMemo(() => Object.keys(grouped).sort(), [grouped])

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
          <Button 
            className="bg-gradient-primary"
            onClick={() => fetchServices(true)}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
                    {[...Array(6)].map((_, r) => (
                      <Skeleton key={r} className="h-10 w-full" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isSearching && (
          <div>
            {isSearchLoading && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Searching services...</span>
                </div>
                <div className="text-xs text-muted-foreground">Scanned {searchScannedPages} / 100 pages</div>
                <div className="mt-4 space-y-3">
                  {[...Array(6)].map((_, r) => (
                    <Skeleton key={r} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            )}

            {!isSearchLoading && (
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
                        <TableRow key={`search-${service.service}`} className="hover:bg-muted/50">
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="text-muted-foreground">☆</span>
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">{service.service}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{service.name}</p>
                              <p className="text-sm text-muted-foreground">Type: {service.type || 'Default'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">${service.rate.toFixed(4)}</TableCell>
                          <TableCell>
                            {service.min} - {service.max}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              Review
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button className="bg-gradient-primary" size="sm">
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Buy
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {searchResults.length === 0 && (
                    <div className="p-6 text-sm text-muted-foreground">No results found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {!isLoading && !error && groupNames.map((group) => {
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
                      <TableRow key={service.service} className="hover:bg-muted/50">
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="text-muted-foreground">☆</span>
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{service.service}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-muted-foreground">Type: {service.type || 'Default'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">${service.rate.toFixed(4)}</TableCell>
                        <TableCell>
                          {service.min} - {service.max}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Review
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button className="bg-gradient-primary" size="sm">
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

        {/* Pagination */}
        {!isLoading && !error && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button variant="outline" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
              Prev
            </Button>
            {/* Always show 1, 2, 3, then ellipsis, then Next */}
            <Button
              variant={currentPage === 1 ? 'default' : 'outline'}
              className={currentPage === 1 ? 'bg-gradient-primary' : ''}
              onClick={() => goToPage(1)}
            >
              1
            </Button>
            <Button
              variant={currentPage === 2 ? 'default' : 'outline'}
              className={currentPage === 2 ? 'bg-gradient-primary' : ''}
              onClick={() => goToPage(2)}
            >
              2
            </Button>
            <Button
              variant={currentPage === 3 ? 'default' : 'outline'}
              className={currentPage === 3 ? 'bg-gradient-primary' : ''}
              onClick={() => goToPage(3)}
            >
              3
            </Button>
            <span className="px-2 text-muted-foreground">…</span>
            {currentPage > 3 && (
              <Button
                variant={'default'}
                className="bg-gradient-primary"
                onClick={() => goToPage(currentPage)}
              >
                {currentPage}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => goToPage(currentPage + 1)}
              disabled={lastPage !== null && currentPage >= lastPage}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
