"use client"
import { useMemo, useState } from "react"
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
import { groupServicesByPlatform } from "./service-api"
import { useServices } from "@/context/ServicesContext"

export default function Services() {
  const { services: allServices, isLoading, error, refetch } = useServices()
  const [query, setQuery] = useState("")

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
            onClick={refetch}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {isLoading && (
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
      </Card>
    </div>
  )
}
