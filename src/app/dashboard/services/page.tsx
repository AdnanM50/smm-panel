// app/services/page.tsx
import React from "react"
import ServicesClient from "./serviceCkient"
import { ApiServiceItem, fetchServicesGradually } from "./service-api"
export default async function ServicesPage(): Promise<React.ReactElement> {
  let initialServices: ApiServiceItem[] = []

  try {
    // Server-side fetch: fetch as many pages as you want (tune maxPages/limit)
    initialServices = await fetchServicesGradually({
      profit: 10,
      maxPages: 100, // increase if you need more pages; be careful about request cost/time
      limit: 100,
      // token: undefined // <-- If you want token-based SSR, pass token read from cookies here
    })
  } catch (err) {
    console.error("SSR fetch services error:", err)
  }

  return <ServicesClient initialServices={initialServices} />
}
