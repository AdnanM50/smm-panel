"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { fetchServicesFromApi, type ApiServiceItem } from '@/app/dashboard/services/service-api'
import { useAuth } from './AuthContext'

interface ServicesContextType {
  services: ApiServiceItem[]
  isLoading: boolean
  error: string | null
  lastFetched: number | null
  refetch: () => Promise<void>
  isStale: boolean
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined)

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

export function ServicesProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [services, setServices] = useState<ApiServiceItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<number | null>(null)

  const isStale = lastFetched ? Date.now() - lastFetched > CACHE_DURATION : true

  const fetchServices = async (force = false) => {
    // Don't fetch if we have recent data and not forcing
    if (!force && services.length > 0 && !isStale && !error) {
      return
    }

    // Don't fetch if already loading
    if (isLoading) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchServicesFromApi({ 
        profit: 10, 
        token: token ?? undefined 
      })
      
      setServices(data)
      setLastFetched(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services')
    } finally {
      setIsLoading(false)
    }
  }

  const refetch = () => fetchServices(true)

  // Auto-fetch on mount if we have a token
  useEffect(() => {
    if (token) {
      fetchServices()
    }
  }, [token])

  // Auto-refetch when cache becomes stale (if user is still active)
  useEffect(() => {
    if (isStale && services.length > 0 && token) {
      const timer = setTimeout(() => {
        fetchServices()
      }, 1000) // Small delay to avoid rapid refetches

      return () => clearTimeout(timer)
    }
  }, [isStale, services.length, token])

  const value: ServicesContextType = {
    services,
    isLoading,
    error,
    lastFetched,
    refetch,
    isStale,
  }

  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>
}

export function useServices() {
  const context = useContext(ServicesContext)
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider')
  }
  return context
}
