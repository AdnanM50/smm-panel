export interface ApiServiceItem {
  service: number
  name: string
  type?: string
  rate: number
  min: number
  max: number
  dripped?: boolean
  refill?: boolean
  cancel?: boolean
  category?: string
  userRate?: number
}

export interface FetchServicesParams {
  profit?: number
  page?: number
  limit?: number
  token?: string
  apiBaseUrl?: string
}

export interface ServicesResponse {
  success: boolean
  services: ApiServiceItem[]
}

const DEFAULT_API_BASE_URL = 'https://smm-panel-khan-it.onrender.com/api'

// In-memory cache for per-page results across client navigations
// Keyed by `${profit}:${page}:${limit}` (token is not included intentionally if it's stable per user)
const pageCache: Map<string, { timestamp: number; data: ApiServiceItem[] }> = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export async function fetchServicesFromApi({
  profit = 10,
  page = 1,
  limit = 100,
  token,
  apiBaseUrl = DEFAULT_API_BASE_URL,
}: FetchServicesParams): Promise<ApiServiceItem[]> {
  const cacheKey = `${profit}:${page}:${limit}`
  const cached = pageCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  const params = new URLSearchParams({
    profit: profit.toString(),
    page: page.toString(),
    limit: limit.toString(),
  })

  const response = await fetch(`${apiBaseUrl}/getServicesFromAPI?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { token } : {}),
    },
    // Next.js automatic caching - cache for 5 minutes
    next: { revalidate: 300 }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch services (${response.status})`)
  }

  const data: ServicesResponse = await response.json()
  if (!data || !data.success || !data.services) {
    return []
  }

  const result = data.services as ApiServiceItem[]
  pageCache.set(cacheKey, { timestamp: Date.now(), data: result })
  return result
}

// Fetch multiple pages gradually (10-20 pages at a time)
export async function fetchServicesGradually({
  profit = 10,
  maxPages = 20,
  limit = 100,
  token,
  apiBaseUrl = DEFAULT_API_BASE_URL,
}: {
  profit?: number
  maxPages?: number
  limit?: number
  token?: string
  apiBaseUrl?: string
}): Promise<ApiServiceItem[]> {
  let allServices: ApiServiceItem[] = []
  let page = 1
  let hasMorePages = true

  // Fetch pages gradually (max 20 pages at a time)
  while (hasMorePages && page <= maxPages) {
    try {
      const pageData = await fetchServicesFromApi({
        profit,
        page,
        limit,
        token,
        apiBaseUrl,
      })
      
      allServices = [...allServices, ...pageData]
      
      // If we get less than the limit, we've reached the last page
      hasMorePages = pageData.length === limit
      page++
      
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error)
      break
    }
  }
  
  return allServices
}

export function clearServicesCache() {
  pageCache.clear()
}

function sanitizeGroupName(raw: string): string {
  // Take the first word token and clean up symbols/brackets
  const trimmed = raw.trim()
  if (!trimmed) return 'Other'
  // Prefer category words like "Instagram", "YouTube", etc.
  const firstToken = trimmed
    .replace(/\[/g, ' ')
    .replace(/\]/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')[0]

  // Normalize common platform casings
  const normalized = firstToken
    .replace(/instagram/i, 'Instagram')
    .replace(/youtube/i, 'YouTube')
    .replace(/tiktok/i, 'TikTok')
    .replace(/facebook/i, 'Facebook')
    .replace(/twitter|x\.?com?/i, 'Twitter')
    .replace(/telegram/i, 'Telegram')
    .replace(/snap(chat)?/i, 'Snapchat')
    .replace(/rumble\.?com?/i, 'Rumble')

  return normalized || 'Other'
}

export function groupServicesByPlatform(services: ApiServiceItem[]): Record<string, ApiServiceItem[]> {
  const groups: Record<string, ApiServiceItem[]> = {}

  services.forEach((svc) => {
    const byCategory = svc.category ? sanitizeGroupName(svc.category) : undefined
    const byName = svc.name ? sanitizeGroupName(svc.name) : 'Other'
    const key = byCategory && byCategory !== 'Other' ? byCategory : byName
    if (!groups[key]) groups[key] = []
    groups[key].push(svc)
  })

  return groups
}


