// app/services/page.tsx
import React from "react"
import ServicesClient from "./serviceCkient"
import { ApiServiceItem, fetchServicesGradually } from "./service-api"
// import ServicesClient from "@/components/services/ServicesClient"
// import { fetchServicesGradually } from "@/components/services/service-api"
// import type { ApiServiceItem } from "@/components/services/service-api"

// If you want to use a user token from cookies for SSR, read cookies here (example commented below).

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

/*
Optional: to use a token from cookies during SSR (Next.js 13+), you could do:

import { cookies } from "next/headers"

const cookieStore = cookies()
const token = cookieStore.get("token")?.value

then pass token to fetchServicesGradually above.
*/
