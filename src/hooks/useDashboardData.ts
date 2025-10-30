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
  const { token, isAuthenticated } = useAuth();
  const [services, setServices] = useState<ApiServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchServicesFromApi({ token }); // ✅ correct argument
        setServices(data); // ✅ now type matches perfectly
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, isAuthenticated]);

  return {
    services,
    loading,
  };
}
