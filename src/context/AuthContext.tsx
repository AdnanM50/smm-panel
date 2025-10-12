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

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signup: (email: string, username: string, name: string, password: string) => Promise<{ success: boolean; message: string }>
  fetchProfileDetails: () => Promise<{ success: boolean; message: string }>
  verifyEmail: (email: string) => Promise<{ success: boolean; message: string }>
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; message: string }>
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = 'https://smm-panel-khan-it.onrender.com/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token')
        const storedUser = localStorage.getItem('auth_user')
        
        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
          
          // Fetch fresh profile details if user is already logged in
          try {
            const response = await fetch(`${API_BASE_URL}/profileDetails`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'token': storedToken,
              },
            })

            const data = await response.json()

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
              localStorage.setItem('auth_user', JSON.stringify(updatedUser))
            }
          } catch (profileError) {
            console.error('Error fetching profile details on init:', profileError)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear invalid data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
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
        
        // Persist to localStorage
        localStorage.setItem('auth_token', authToken)
        localStorage.setItem('auth_user', JSON.stringify(userData))

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

      const response = await fetch(`${API_BASE_URL}/profileDetails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        },
      })

      const data = await response.json()

      if (response.ok && data.status === 'Success' && data.data && data.data.length > 0) {
        const profileData = data.data[0] // API returns array with single user object
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
        localStorage.setItem('auth_user', JSON.stringify(updatedUser))

        return { success: true, message: 'Profile details updated successfully' }
      } else {
        return { success: false, message: data.message || 'Failed to fetch profile details' }
      }
    } catch (error) {
      console.error('Profile details fetch error:', error)
      return { success: false, message: 'Network error while fetching profile details' }
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

  const logout = () => {
    setUser(null)
    setToken(null)
    // Clear all auth-related data from localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    // Clear any other potential auth data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    signup,
    fetchProfileDetails,
    verifyEmail,
    verifyOTP,
    resetPassword,
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
