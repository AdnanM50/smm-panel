"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchServicesFromApi } from "@/app/dashboard/services/service-api"; // ✅ adjust path if needed
import type { ApiServiceItem } from "@/app/dashboard/services/service-api";   // ✅ import existing type

interface FetchServicesParams {
  token: string;
}

interface DashboardData {
  services: ApiServiceItem[];
  loading: boolean;
}

export function useDashboardData(): DashboardData {
  // Only require a token to fetch services — some app flows set the token
  // before the full user profile is populated. Waiting for `isAuthenticated`
  // can delay or prevent the services fetch. Fetch as soon as a token is
  // available.
  const { token } = useAuth();
  const [services, setServices] = useState<ApiServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      console.debug('[useDashboardData] no token yet')
      return
    }

    console.debug('[useDashboardData] token present, fetching services', token?.slice?.(0,10) + '...')

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchServicesFromApi({ token });
        setServices(data); // ✅ now type matches perfectly
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return {
    services,
    loading,
  };
}
