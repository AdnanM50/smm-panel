"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE_URL = "https://smm-panel-khan-it.up.railway.app/api";

type DashboardData = {
  balance: number;
  totalSpent: number;
  totalUsers: number;
  totalProfit: number;
};

const CACHE_DURATION = 5 * 60 * 1000;

let cache: {
  data: DashboardData | null;
  timestamp: number;
  loading: boolean;
} = {
  data: null,
  timestamp: 0,
  loading: false,
};

export default function DashboardStats() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!token) return;

    const fetchData = async () => {
      const now = Date.now();
      if (cache.data && now - cache.timestamp < CACHE_DURATION && !cache.loading) {
        if (mounted) setData(cache.data);
        return;
      }

      setLoading(true);
      setError(null);
      cache.loading = true;

      try {
        const res = await fetch(`${API_BASE_URL}/getDashboardData`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
          cache: "force-cache",
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Failed to fetch");

        const d = json?.data || json?.data?.[0] || null;
        
        if (mounted) {
          setData(d);
          cache = {
            data: d,
            timestamp: Date.now(),
            loading: false,
          };
        }
      } catch (err: any) {
        if (mounted) {
          setError(String(err?.message || err));
          cache.loading = false;
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [token]);

  const formatCurrency = (n: number) => {
    try {
      return new Intl.NumberFormat(undefined, { 
        style: "currency", 
        currency: "USD", 
        minimumFractionDigits: 2,
        maximumFractionDigits: 6 
      }).format(n);
    } catch {
      return String(n);
    }
  };

  const formatNumber = (n: number) => {
    return new Intl.NumberFormat().format(n);
  };

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon, 
    gradient,
    chartColor,
    loading 
  }: {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
    chartColor: string;
    loading: boolean;
  }) => (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl shadow-2xl shadow-black/5 transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">
      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
      
      {/* Animated Border Glow */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`} />
      
      {/* Mini Chart/Graph Background */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${chartColor} opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
      
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 relative z-10">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
            {title}
          </CardTitle>
          <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </CardDescription>
        </div>
        <div className={`rounded-2xl p-3 ${gradient} text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}>
          {icon}
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-32 rounded-lg" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {value}
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${chartColor}`} />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Updated just now
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Corner Accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 -translate-y-10 translate-x-10 rounded-full ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
    </Card>
  );

  const RefreshIndicator = () => (
    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
      <div className="flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span>Live Updates</span>
      </div>

    </div>
  );

  return (
    <div className="md:mt-16 mt-6 w-full rounded-2xl bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-100/20 dark:from-gray-900 dark:via-blue-950/20 dark:to-indigo-950/10 p-6">
      <div className=" mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
              Real-time business insights and performance metrics in one beautiful overview
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <RefreshIndicator />
            <Badge variant="secondary" className="px-3 py-1.5 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                System Active
              </div>
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-6">
          <StatCard
            title="Available Balance"
            value={data ? formatCurrency(data.balance) : "$0.00"}
            description="Current account funds"
            loading={loading}
            gradient="bg-gradient-to-br from-emerald-400 to-emerald-600"
            chartColor="bg-emerald-500"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" />
              </svg>
            }
          />

          <StatCard
            title="Total Spent"
            value={data ? formatCurrency(data.totalSpent) : "$0.00"}
            description="All-time user spending"
            loading={loading}
            gradient="bg-gradient-to-br from-rose-400 to-rose-600"
            chartColor="bg-rose-500"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 13h3a2 2 0 012 2v0a2 2 0 01-2 2h-3" />
              </svg>
            }
          />

          <StatCard
            title="Total Users"
            value={data ? formatNumber(data.totalUsers) : "0"}
            description="Registered customers"
            loading={loading}
            gradient="bg-gradient-to-br from-blue-400 to-blue-600"
            chartColor="bg-blue-500"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M7 20H2v-2a4 4 0 014-4h1m8-8a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />

          <StatCard
            title="Net Profit"
            value={data ? formatCurrency(data.totalProfit) : "$0.00"}
            description="Total profit earned"
            loading={loading}
            gradient="bg-gradient-to-br from-amber-400 to-amber-600"
            chartColor="bg-amber-500"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
              </svg>
            }
          />
        </div>

        {/* Status Messages */}
        {error && (
          <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-950/50 backdrop-blur-xl p-6 animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
              <div className="rounded-full bg-red-100 dark:bg-red-900 p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold">Unable to load data</div>
                <p className="text-sm mt-1 opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

       
      </div>
    </div>
  );
}