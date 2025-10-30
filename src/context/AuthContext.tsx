"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  _id: string;
  id: string;
  email: string;
  username: string;
  name: string;
  balance: number;
  totalSpent: number;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UpdateProfileData {
  email?: string;
  username?: string;
  name?: string;
  password?: string;
  balance?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (email: string, username: string, name: string, password: string) => Promise<{ success: boolean; message: string }>;
  fetchProfileDetails: () => Promise<{ success: boolean; message: string }>;
  updateProfile: (profileData: UpdateProfileData) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  validateToken: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE_URL = "https://smm-panel-khan-it.up.railway.app/api";

// --- caching utils ---
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;
const pendingRequests = new Map<string, Promise<any>>();

async function cachedApiCall(endpoint: string, options: RequestInit, cacheKey?: string): Promise<any> {
  const key = cacheKey || `${endpoint}-${JSON.stringify(options)}`;

  if (pendingRequests.has(key)) return pendingRequests.get(key);

  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { response: { ok: true }, data: cached.data };
  }

  const requestPromise = fetch(`${API_BASE_URL}${endpoint}`, options)
    .then(async (response) => {
      const data = await response.json();
      if (response.ok) apiCache.set(key, { data, timestamp: Date.now() });
      pendingRequests.delete(key);
      return { response, data };
    })
    .catch((err) => {
      pendingRequests.delete(key);
      throw err;
    });

  pendingRequests.set(key, requestPromise);
  return requestPromise;
}

// --- MAIN PROVIDER ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (typeof window === "undefined") return;
        const storedToken = localStorage.getItem("auth_token");
        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        setToken(storedToken);

        const { response, data } = await cachedApiCall("/profileDetails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: storedToken,
          },
        });

        if (response.ok && data.status === "Success" && data.data?.length > 0) {
          const p = data.data[0];
          setUser({
            _id: p._id,
            id: p._id,
            email: p.email,
            username: p.username,
            name: p.name,
            balance: p.balance,
            totalSpent: p.totalSpent,
            role: p.role,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          });
        } else {
          localStorage.removeItem("auth_token");
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // --- LOGIN FIXED ---
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.status === "Success") {
        const authToken = data.token;
        const userData: User = {
          _id: data.user?.id || data.id,
          id: data.user?.id || data.id,
          email: data.user?.email || email,
          username: data.user?.username || "",
          name: data.user?.name || "",
          balance: data.user?.balance || 0,
          totalSpent: data.user?.totalSpent || 0,
          role: data.user?.role || "user",
          createdAt: data.user?.createdAt || "",
          updatedAt: data.user?.updatedAt || "",
        };

        // ✅ Save token immediately
        localStorage.setItem("auth_token", authToken);
        setToken(authToken);
        setUser(userData);

        // Wait for state to apply before returning success
        return { success: true, message: "Login successful" };
      }

      return { success: false, message: data.message || "Invalid credentials" };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, message: "Network error" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated, login, logout } as any}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
