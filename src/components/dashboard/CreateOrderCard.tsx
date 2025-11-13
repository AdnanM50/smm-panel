"use client"
import React, { CSSProperties } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileStack, Info, AlertCircle, CheckCircle2, XCircle, RefreshCw, Slash } from "lucide-react"
import type { ApiServiceItem } from "@/app/dashboard/services/service-api"
import type { MassOrderItem } from "@/app/dashboard/mass-order/massOrder-api"

interface Props {
  isMassMode: boolean
  setIsMassMode: React.Dispatch<React.SetStateAction<boolean>>
  dynamicPlatforms: string[]
  selectedPlatform: string
  handlePlatformSelect: (name: string) => void
  searchQuery: string
  setSearchQuery: (s: string) => void
  isSearching: boolean
  services: ApiServiceItem[]
  selectedService: ApiServiceItem | null
  setSelectedService: (s: ApiServiceItem | null) => void
  setServices: (s: ApiServiceItem[]) => void
  moInput: string
  setMoInput: (v: string) => void
  moErrors: string[]
  moIsCalculating: boolean
  moOrders: MassOrderItem[]
  moTotalProfit: number
  moIsSubmitting: boolean
  handleMoSubmit: () => void

  link: string
  setLink: (v: string) => void
  linkError: string | null
  quantity: string
  setQuantity: (v: string) => void
  quantityError: string | null
  totalCharge: number
  handleSubmitOrder: () => void
  isSubmitting: boolean

  validateLink: (v: string) => boolean
  validateQuantity: (v: string, svc?: ApiServiceItem | null) => boolean
}

export default function CreateOrderCard({
  isMassMode,
  setIsMassMode,
  dynamicPlatforms,
  selectedPlatform,
  handlePlatformSelect,
  searchQuery,
  setSearchQuery,
  isSearching,
  services,
  selectedService,
  setSelectedService,
  setServices,
  moInput,
  setMoInput,
  moErrors,
  moIsCalculating,
  moOrders,
  moTotalProfit,
  moIsSubmitting,
  handleMoSubmit,
  link,
  setLink,
  linkError,
  quantity,
  setQuantity,
  quantityError,
  totalCharge, // left available if parent uses it elsewhere
  handleSubmitOrder,
  isSubmitting,
  validateLink,
  validateQuantity,
}: Props) {
  const iconMap: Record<string, any> = {
    Telegram: undefined,
  }

  const getPlatformPillStyles = (isActive: boolean): CSSProperties => ({
    backgroundColor: isActive ? 'var(--dashboard-pill-active-bg)' : 'var(--dashboard-pill-bg)',
    borderColor: isActive ? 'var(--dashboard-pill-active-border)' : 'var(--dashboard-pill-border)',
    color: isActive ? 'var(--dashboard-pill-active-text)' : 'var(--dashboard-pill-text)',
  })

  const renderPlatformButtons = (groupIndex: number) => (
    <>
      <Button
        key={`platform-all-${groupIndex}`}
        size="sm"
        variant="outline"
        className="whitespace-nowrap transition-colors"
        style={getPlatformPillStyles(selectedPlatform === 'All')}
        onClick={() => handlePlatformSelect('All')}
      >
        <Plus className="h-4 w-4 mr-1" />
        All
      </Button>

      {dynamicPlatforms.map((name, index) => {
        const IconComponent = iconMap[name] || Plus
        const isSelected = selectedPlatform === name

        return (
          <Button
            key={`platform-${groupIndex}-${name}-${index}`}
            size="sm"
            variant="outline"
            className="whitespace-nowrap transition-colors"
            style={getPlatformPillStyles(isSelected)}
            onClick={() => handlePlatformSelect(name)}
          >
            <IconComponent className="h-4 w-4 mr-1" />
            {name}
          </Button>
        )
      })}
    </>
  )

  // Safely parse quantity to a number (fallback to 0)
  const parsedQuantity = (() => {
    if (!quantity) return 0
    const n = Number(quantity)
    return Number.isFinite(n) && !Number.isNaN(n) ? n : 0
  })()

  // Determine rate: userRate if present, otherwise default rate, otherwise 0
  const rate = selectedService ? (selectedService.userRate ?? selectedService?.userRate ?? 0) : 0

  // Compute total charge as userRate * quantity (as requested)
  const computedTotal = rate * parsedQuantity

  return (
    <Card className="w-full" style={{ backgroundColor: 'var(--dashboard-bg-card)' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: 'var(--dashboard-text-primary)' }}>
          <Plus className="h-5 w-5" />
          Create order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button variant={isMassMode ? 'outline' : 'default'} className="flex-1" style={{ borderColor: isMassMode ? 'var(--border)' : undefined, backgroundColor: isMassMode ? 'var(--input)' : 'var(--dashboard-blue)', color: isMassMode ? 'var(--dashboard-text-primary)' : undefined }} onClick={() => setIsMassMode(false)}>
            <Plus className="h-4 w-4 mr-2" />
            New order
          </Button>
          <Button variant={isMassMode ? 'default' : 'outline'} className="flex-1" style={{ borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)' }} onClick={() => setIsMassMode(prev => !prev)}>
            <FileStack className="h-4 w-4 mr-2" />
            Mass order
          </Button>
        </div>

        <div className="marquee-container pb-2">
          <div className="marquee-track">
            {dynamicPlatforms.length === 0 ? (
              <div className="marquee-group inline-flex flex-shrink-0 items-center gap-2 pr-4">
                <div className="inline-flex items-center gap-2">
                  <Skeleton className="h-8 w-14 rounded-full" />
                  <Skeleton className="h-8 w-10 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            ) : (
              [0, 1].map((groupIndex) => (
                <div key={groupIndex} className="marquee-group inline-flex flex-shrink-0 items-center gap-2 pr-4">
                  {renderPlatformButtons(groupIndex)}
                </div>
              ))
            )}
          </div>
        </div>

        {isMassMode ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <label className="text-lg font-semibold text-foreground">Mass orders (one per line)</label>
              <Info className="h-5 w-5 text-muted-foreground" />
            </div>
            <Textarea placeholder="service_id | link | quantity\n4084 | https://web.telegram.org/a/#8092633438 | 10\n2199 | https://example.com | 5" value={moInput} onChange={(e) => setMoInput(e.target.value)} className="w-full min-h-[220px] bg-background border-border font-mono text-sm hover:border-primary/50 transition-colors" />

            {moErrors.length > 0 && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800 mt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">Validation Errors:</p>
                    <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">{moErrors.map((error, index) => <li key={index}>• {error}</li>)}</ul>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center gap-4 flex-col sm:flex-row">
              <div className="flex-1 w-full">
                <div className="text-sm text-muted-foreground">Estimated profit: {moIsCalculating ? 'Calculating...' : `$${moTotalProfit.toFixed(4)}`}</div>
                <div className="text-xs text-muted-foreground">{moOrders.length} order{moOrders.length !== 1 ? 's' : ''}</div>
              </div>
              <div className="w-full sm:w-48">
                <Button className="w-full" onClick={handleMoSubmit} disabled={moIsSubmitting || moOrders.length === 0 || moErrors.length > 0} style={{ backgroundColor: 'var(--dashboard-blue)' }}>{moIsSubmitting ? 'Submitting...' : `Submit Mass Order (${moOrders.length})`}</Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--dashboard-text-muted)' }} />
              <Input placeholder={selectedPlatform === 'All' ? 'Search services by name or ID...' : `Search ${selectedPlatform} services by name or ID... (or search anything)`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-full" style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)' }} />
              {isSearching && <div className="absolute right-3 top-1/2 transform -translate-y-1/2"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div></div>}
            </div>

            {selectedPlatform !== 'All' && (searchQuery.trim() !== '' || selectedService || isSearching || services.length > 0) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between"><h3 className="text-lg font-semibold" style={{ color: 'var(--dashboard-text-primary)' }}>{selectedPlatform} Services</h3></div>
                <div className="max-h-80 overflow-y-auto border rounded-lg bg-background">
                  {selectedService ? (
                    <div key={selectedService.service} onClick={() => setSelectedService(selectedService)} className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0 transition-colors">
                      <div className="flex items-center justify-between"><div className="flex-1"><div className="font-medium text-sm">{selectedService.service} - {selectedService.name}</div><div className="text-xs text-muted-foreground">Rate: ${selectedService.userRate || selectedService?.userRate} | Min: {selectedService.min} | Max: {selectedService.max}</div></div><div className="text-xs text-muted-foreground">{selectedService.category}</div></div>
                    </div>
                  ) : isSearching ? (
                    <div className="space-y-2 p-2">{[...Array(5)].map((_, i) => <div key={i} className="p-3 border-b last:border-b-0"><div className="flex items-center justify-between"><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div><Skeleton className="h-3 w-16" /></div></div>)}</div>
                  ) : services.length > 0 ? (
                    services.map((service) => (
                      <div key={service.service} onClick={() => { setSelectedService(service); setSearchQuery(service.name); setServices([]) }} className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0 transition-colors">
                        <div className="flex items-center justify-between"><div className="flex-1"><div className="font-medium text-sm">{service.service} - {service.name}</div><div className="text-xs text-muted-foreground">Rate: ${service.userRate || service?.userRate} | Min: {service.min} | Max: {service.max}</div></div><div className="text-xs text-muted-foreground">{service.category}</div></div>
                      </div>
                    ))
                  ) : (<div className="p-6 text-center text-muted-foreground">No {selectedPlatform} services found</div>)}
                </div>
              </div>
            )}

            {selectedPlatform === 'All' && services.length > 0 && (
              <div className="max-h-60 overflow-y-auto border rounded-lg bg-background">
                {services.map((service) => (
                    <div key={service.service} onClick={() => { setSelectedService(service); setSearchQuery(service.name); setServices([]) }} className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0">
                    <div className="flex items-center justify-between"><div className="flex-1"><div className="font-medium text-sm">{service.service} - {service.name}</div><div className="text-xs text-muted-foreground">Rate: ${service.userRate || service?.userRate} | Min: {service.min} | Max: {service.max}</div></div><div className="text-xs text-muted-foreground">{service.category}</div></div>
                  </div>
                ))}
              </div>
            )}

            {selectedService && (
              <div
                className="space-y-3 rounded-lg border px-4 py-3"
                style={{
                  backgroundColor: 'var(--dashboard-pill-bg)',
                  borderColor: 'var(--dashboard-pill-border)',
                }}
              >
                <div className="flex flex-wrap items-start gap-3">
                  {selectedService.cancel ? (
                    <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--dashboard-green)' }} />
                  ) : (
                    <XCircle className="h-5 w-5" style={{ color: 'var(--dashboard-red)' }} />
                  )}
                  <div className="flex-1 min-w-[12rem] space-y-1">
                    <Badge
                      variant="outline"
                      className="uppercase tracking-wide"
                      style={{
                        borderColor: 'var(--dashboard-pill-border)',
                        color: 'var(--dashboard-pill-text)',
                      }}
                    >
                      Cancellation
                    </Badge>
                    <p className="text-sm" style={{ color: 'var(--dashboard-text-primary)' }}>
                      {selectedService.cancel
                        ? 'You can request a cancellation while the order is processing.'
                        : 'This service cannot be cancelled once the order is placed.'}
                    </p>
                    {!selectedService.cancel && (
                      <p className="text-xs" style={{ color: 'var(--dashboard-text-muted)' }}>
                        Double-check the link and quantity before submitting.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-start gap-3">
                  {selectedService.refill ? (
                    <RefreshCw className="h-5 w-5" style={{ color: 'var(--dashboard-blue)' }} />
                  ) : (
                    <Slash className="h-5 w-5" style={{ color: 'var(--dashboard-text-muted)' }} />
                  )}
                  <div className="flex-1 min-w-[12rem] space-y-1">
                    <Badge
                      variant="outline"
                      className="uppercase tracking-wide"
                      style={{
                        borderColor: 'var(--dashboard-pill-border)',
                        color: 'var(--dashboard-pill-text)',
                      }}
                    >
                      Refill
                    </Badge>
                    <p className="text-sm" style={{ color: 'var(--dashboard-text-primary)' }}>
                      {selectedService.refill
                        ? 'Refill requests are available if the counts drop after completion.'
                        : 'Refill is not offered for this service.'}
                    </p>
                    {selectedService.refill && (
                      <p className="text-xs" style={{ color: 'var(--dashboard-text-muted)' }}>
                        Please check the provider rules for the allowed refill window.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium" style={{ color: 'var(--dashboard-text-primary)' }}>Link *</Label>
              <Input placeholder="Enter your link" value={link} onChange={(e) => { setLink(e.target.value); validateLink(e.target.value) }} onBlur={() => validateLink(link)} style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)' }} />
              {linkError && <div className="text-sm text-red-500 mt-2">{linkError}</div>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium" style={{ color: 'var(--dashboard-text-primary)' }}>Quantity * {selectedService && `(Min: ${selectedService.min}, Max: ${selectedService.max})`}</Label>
              <Input
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => {
                  // keep input as string to allow partial edits (e.g. "")
                  const val = e.target.value
                  // optionally you can restrict to integers only:
                  // const normalized = val.replace(/\D+/g, '')
                  setQuantity(val)
                  validateQuantity(val, selectedService)
                }}
                onBlur={() => validateQuantity(quantity, selectedService)}
                min={selectedService?.min || 0}
                max={selectedService?.max || 999999}
                style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)' }}
              />
              {quantityError && <div className="text-sm text-red-500 mt-2">{quantityError}</div>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium" style={{ color: 'var(--dashboard-text-primary)' }}>Total Charge</Label>
              <Input value={`$${computedTotal.toFixed(4)}`} readOnly style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)', fontWeight: '600' }} />
            </div>

            <Button
              className="w-full"
              style={{ backgroundColor: 'var(--dashboard-blue)', fontSize: '1.125rem', padding: '1.5rem 0' }}
              onClick={handleSubmitOrder}
              disabled={
                !selectedService ||
                !link.trim() ||
                !quantity.trim() ||
                !!linkError ||
                !!quantityError ||
                isSubmitting ||
                parsedQuantity <= 0
              }
            >
              {isSubmitting ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>Placing Order...</>) : 'Submit Order'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}