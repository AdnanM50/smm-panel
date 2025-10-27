import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

interface DashboardData {
  balance: number
  totalSpent: number
}

// Cache for dashboard data
const dashboardCache = new Map<string, { data: DashboardData; timestamp: number }>()
const DASHBOARD_CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

// Pending requests for deduplication
const pendingDashboardRequests = new Map<string, Promise<any>>()

export function useDashboardData() {
  const { token, validateToken } = useAuth()
  const [balance, setBalance] = useState<number | null>(null)
  const [totalSpent, setTotalSpent] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    if (!token) {
      setIsLoading(false)
      return
    }

    const cacheKey = `dashboard-${token}`
    
    // Check if request is already pending
    if (pendingDashboardRequests.has(cacheKey)) {
      try {
        const result = await pendingDashboardRequests.get(cacheKey)
        if (result) {
          setBalance(result.balance)
          setTotalSpent(result.totalSpent)
          setIsLoading(false)
        }
        return
      } catch (error) {
        // Handle error from pending request
        console.error('Error from pending dashboard request:', error)
      }
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = dashboardCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < DASHBOARD_CACHE_DURATION) {
        setBalance(cached.data.balance)
        setTotalSpent(cached.data.totalSpent)
        setIsLoading(false)
        return
      }
    }

    // Validate token before making API calls
    if (!(await validateToken())) {
      setError('Authentication expired. Please login again.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    // Create new request
    const requestPromise = fetch('https://smm-panel-khan-it.onrender.com/api/getDashboardData', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        token,
      },
      next: { revalidate: 60 },
    })
      .then(async (res) => {
        const data = await res.json()
        
        if (res.ok && data?.success && data?.data) {
          const dashboardData = {
            balance: Number(data.data.balance) || 0,
            totalSpent: Number(data.data.totalSpent) || 0,
          }
          
          // Cache the result
          dashboardCache.set(cacheKey, { data: dashboardData, timestamp: Date.now() })
          
          setBalance(dashboardData.balance)
          setTotalSpent(dashboardData.totalSpent)
          setError(null)
          
          return dashboardData
        } else if (res.status === 401) {
          setError('Authentication expired. Please login again.')
          throw new Error('Authentication expired')
        } else {
          setError('Failed to load dashboard data')
          throw new Error('Failed to load dashboard data')
        }
      })
      .catch((error) => {
        console.error('Error loading dashboard data:', error)
        setError(error.message || 'Failed to load dashboard data')
        throw error
      })
      .finally(() => {
        setIsLoading(false)
        // Remove from pending requests
        pendingDashboardRequests.delete(cacheKey)
      })

    // Store pending request
    pendingDashboardRequests.set(cacheKey, requestPromise)

    try {
      await requestPromise
    } catch (error) {
      // Error already handled in the promise
    }
  }, [token, validateToken])

  // Initial load
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])


  useEffect(() => {
    if (token) {
      // forceRefresh=true so we don't return stale cached data immediately
      fetchDashboardData(true)
    }
    // Intentionally only react to token changes here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Refresh function for manual refresh
  const refresh = useCallback(() => {
    fetchDashboardData(true)
  }, [fetchDashboardData])

  return {
    balance,
    totalSpent,
    isLoading,
    error,
    refresh
  }
}
