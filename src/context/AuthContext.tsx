"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  _id: string
  id: string
  email: string
  username: string
  name: string
  balance: number
  totalSpent: number
  role: string
  createdAt: string
  updatedAt: string
}

interface UpdateProfileData {
  email?: string
  username?: string
  name?: string
  password?: string
  balance?: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signup: (email: string, username: string, name: string, password: string) => Promise<{ success: boolean; message: string }>
  fetchProfileDetails: () => Promise<{ success: boolean; message: string }>
  updateProfile: (profileData: UpdateProfileData) => Promise<{ success: boolean; message: string }>
  verifyEmail: (email: string) => Promise<{ success: boolean; message: string }>
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; message: string }>
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  validateToken: () => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = 'https://smm-panel-khan-it.onrender.com/api'

// Cache for API responses to prevent duplicate calls
// cached entry now optionally contains a small response stub so callers
// receive a consistent { response, data } shape when served from cache
const apiCache = new Map<string, { data: any; timestamp: number; response?: { ok: boolean }; promise?: Promise<any> }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Request deduplication - prevents multiple identical requests
const pendingRequests = new Map<string, Promise<any>>()

// Generic API call function with caching and deduplication
async function cachedApiCall(endpoint: string, options: RequestInit, cacheKey?: string): Promise<any> {
  const key = cacheKey || `${endpoint}-${JSON.stringify(options)}`
  
  // Check if request is already pending
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)
  }
  
  // Check cache first - return same shape as a fresh request: { response, data }
  const cached = apiCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    // cached.entry contains .data and optionally .response
    return { response: cached.response ?? { ok: true }, data: cached.data }
  }
  
  // Create new request
  const requestPromise = fetch(`${API_BASE_URL}${endpoint}`, options)
    .then(async (response) => {
      const data = await response.json()

      // Cache successful responses. Store a small response stub so cached callers
      // receive the same { response, data } shape as a fresh request.
      if (response.ok) {
        apiCache.set(key, { data, response: { ok: response.ok }, timestamp: Date.now() })
      }

      // Remove from pending requests
      pendingRequests.delete(key)

      return { response, data }
    })
    .catch((error) => {
      // Remove from pending requests on error
      pendingRequests.delete(key)
      throw error
    })
  
  // Store pending request
  pendingRequests.set(key, requestPromise)
  
  return requestPromise
}

// Clear cache function
function clearApiCache() {
  apiCache.clear()
  pendingRequests.clear()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (typeof window === "undefined") {
          setIsLoading(false)
          return
        }
        
        const storedToken = localStorage.getItem('auth_token')
        
        if (storedToken) {
          setToken(storedToken)
          
          // Always fetch fresh user data from API instead of relying on stored data
          try {
            const { response, data } = await cachedApiCall('/profileDetails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'token': storedToken,
              },
            }, `profileDetails-${storedToken}`)

            if (response.ok && data.status === 'Success' && data.data && data.data.length > 0) {
              const profileData = data.data[0]
              const updatedUser: User = {
                _id: profileData._id,
                id: profileData._id,
                email: profileData.email,
                username: profileData.username,
                name: profileData.name,
                balance: profileData.balance,
                totalSpent: profileData.totalSpent,
                role: profileData.role,
                createdAt: profileData.createdAt,
                updatedAt: profileData.updatedAt,
              }

              setUser(updatedUser)
              // Don't store user data in localStorage - always fetch fresh from API
            } else {
              // Token is invalid or expired, clear it
              console.warn('Token validation failed, clearing auth data')
              localStorage.removeItem('auth_token')
              setToken(null)
              setUser(null)
            }
          } catch (profileError) {
            console.error('Error validating token:', profileError)
            // Network error or invalid token, clear auth data
            localStorage.removeItem('auth_token')
            setToken(null)
            setUser(null)
          }
        } else {
          // No stored token, user is not authenticated
          setUser(null)
          setToken(null)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear invalid data
        if (typeof window !== "undefined") {
          localStorage.removeItem('auth_token')
        }
        setUser(null)
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok && data.status === 'Success') {
        // Store token and user data
        const authToken = data.token
        const userData: User = {
          _id: data.user?.id || data.id || '1',
          id: data.user?.id || data.id || '1',
          email: data.user?.email || email,
          username: data.user?.username || data.username || email.split('@')[0],
          name: data.user?.name || data.name || email.split('@')[0],
          balance: 0,
          totalSpent: 0,
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        setToken(authToken)
        setUser(userData)
        
        // Persist only token to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem('auth_token', authToken)
        }

        // Fetch detailed profile information after login
        await fetchProfileDetails()

        return { success: true, message: data.message || 'Login successful' }
      } else {
        return { success: false, message: data.message || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, username: string, name: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          name,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok && data.status === 'Success') {
        return { success: true, message: data.message || 'Registration completed successfully' }
      } else {
        return { success: false, message: data.message || 'Registration failed. Please try again.' }
      }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProfileDetails = async (): Promise<{ success: boolean; message: string }> => {
    try {
      if (!token) {
        return { success: false, message: 'No authentication token available' }
      }

      const { response, data } = await cachedApiCall('/profileDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        },
      }, `profileDetails-${token}`)

      if (response.ok && data.status === 'Success' && data.data && data.data.length > 0) {
        const profileData = data.data[0]
        const updatedUser: User = {
          _id: profileData._id,
          id: profileData._id,
          email: profileData.email,
          username: profileData.username,
          name: profileData.name,
          balance: profileData.balance,
          totalSpent: profileData.totalSpent,
          role: profileData.role,
          createdAt: profileData.createdAt,
          updatedAt: profileData.updatedAt,
        }

        setUser(updatedUser)
        // Don't store user data in localStorage - always fetch fresh from API

        return { success: true, message: 'Profile details updated successfully' }
      } else {
        return { success: false, message: data.message || 'Failed to fetch profile details' }
      }
    } catch (error) {
      console.error('Profile details fetch error:', error)
      return { success: false, message: 'Network error while fetching profile details' }
    }
  }

  const updateProfile = async (profileData: UpdateProfileData): Promise<{ success: boolean; message: string }> => {
    try {
      if (!token || !user) {
        return { success: false, message: 'No authentication token or user data available' }
      }

      const response = await fetch(`${API_BASE_URL}/profileUpdate/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        },
        body: JSON.stringify(profileData),
      })

      const data = await response.json()

      if (response.ok && data.status === 'Success') {
        // Update local user state with new data
        const updatedUser: User = {
          ...user,
          email: profileData.email || user.email,
          username: profileData.username || user.username,
          name: profileData.name || user.name,
          balance: profileData.balance !== undefined ? profileData.balance : user.balance,
          updatedAt: new Date().toISOString(),
        }

        setUser(updatedUser)
        // Don't store user data in localStorage - always fetch fresh from API

        return { success: true, message: data.message || 'Profile updated successfully' }
      } else {
        return { success: false, message: data.message || 'Failed to update profile' }
      }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, message: 'Network error while updating profile' }
    }
  }

  const verifyEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/verifyEmail/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && data.status === 'Success') {
        return { success: true, message: data.message || 'Verification code sent to your email' }
      } else {
        return { success: false, message: data.message || 'Failed to send verification code' }
      }
    } catch (error) {
      console.error('Verify email error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  const verifyOTP = async (email: string, otp: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/verifyOTP/${email}/${otp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && data.status === 'Success') {
        return { success: true, message: data.message || 'OTP verified successfully' }
      } else {
        return { success: false, message: data.message || 'Invalid OTP' }
      }
    } catch (error) {
      console.error('Verify OTP error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  const resetPassword = async (email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/passwordReset/${email}/${otp}/${newPassword}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && data.status === 'Success') {
        return { success: true, message: data.message || 'Password reset successfully' }
      } else {
        return { success: false, message: data.message || 'Failed to reset password' }
      }
    } catch (error) {
      console.error('Reset password error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  const validateToken = async (): Promise<boolean> => {
    try {
      if (!token) {
        return false
      }

      // Use cached profileDetails call - if it's cached and recent, token is valid
      const { response, data } = await cachedApiCall('/profileDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        },
      }, `profileDetails-${token}`)

      if (response.ok && data.status === 'Success' && data.data && data.data.length > 0) {
        return true
      }
      
      // Token is invalid, clear it and cache
      console.warn('Token validation failed')
      localStorage.removeItem('auth_token')
      setToken(null)
      setUser(null)
      clearApiCache() // Clear cache when token is invalid
      return false
    } catch (error) {
      console.error('Token validation error:', error)
      // Network error, assume token is still valid for now
      return true
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    // Clear token from localStorage and clear API cache
    if (typeof window !== "undefined") {
      localStorage.removeItem('auth_token')
    }
    clearApiCache()
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    signup,
    fetchProfileDetails,
    updateProfile,
    verifyEmail,
    verifyOTP,
    resetPassword,
    validateToken,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
