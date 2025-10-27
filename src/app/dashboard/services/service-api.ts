// components/services/service-api.ts
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
  signal?: AbortSignal | undefined
  apiBaseUrl?: string
}

export interface ServicesResponse {
  success: boolean
  services: ApiServiceItem[]
}

const DEFAULT_API_BASE_URL = 'https://smm-panel-khan-it.onrender.com/api'

// In-memory cache for per-page results across client navigations
// Keyed by `${profit}:${page}:${limit}` (token intentionally excluded)
const pageCache: Map<string, { timestamp: number; data: ApiServiceItem[] }> = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export async function fetchServicesFromApi({
  profit = 10,
  page = 1,
  limit = 100,
  token,
  apiBaseUrl = DEFAULT_API_BASE_URL,
  signal,
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

  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}/getServicesFromAPI?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { token } : {}),
      },
      // support aborting client-side searches
      ...(signal ? { signal } : {}),
      // For Next.js client/server, you may control caching. This line is okay for server fetch in Next 13+.
      next: { revalidate: 300 },
    })
  } catch (err) {
    // Network error or similar - don't throw, return empty and let callers decide
    console.warn('fetchServicesFromApi: network/fetch error', err)
    return []
  }

  if (!response.ok) {
    // Handle 401 specifically - token might be expired
    if (response.status === 401) {
      console.warn(`fetchServicesFromApi: token expired or invalid (${response.status})`)
      // Clear cache to force fresh fetch with new token
      pageCache.clear()
    } else {
      console.warn(`fetchServicesFromApi: upstream returned ${response.status} ${response.statusText}`)
    }
    return []
  }

  const data: ServicesResponse = await response.json()
  if (!data || !data.success || !data.services) {
    return []
  }

  const result = data.services as ApiServiceItem[]
  // Only cache non-empty results to avoid caching auth/empty states.
  if (result && result.length > 0) {
    pageCache.set(cacheKey, { timestamp: Date.now(), data: result })
  }
  return result
}

// Fetch multiple pages gradually (10-20 pages at a time)
export async function fetchServicesGradually({
  profit = 10,
  maxPages = 20,
  limit = 100,
  token,
  apiBaseUrl = DEFAULT_API_BASE_URL,
  signal,
}: {
  profit?: number
  maxPages?: number
  limit?: number
  token?: string
  apiBaseUrl?: string
  signal?: AbortSignal | undefined
}): Promise<ApiServiceItem[]> {
  let allServices: ApiServiceItem[] = []
  let page = 1
  let hasMorePages = true

  while (hasMorePages && page <= maxPages) {
    try {
      const pageData = await fetchServicesFromApi({
        profit,
        page,
        limit,
        token,
        apiBaseUrl,
        signal,
      })
      // If the very first page is empty, likely upstream refused or returned no data;
      // stop early and return whatever we've gathered so far (probably empty).
      if (page === 1 && pageData.length === 0) {
        console.warn('fetchServicesGradually: first page empty, stopping to avoid long scans')
        break
      }

      allServices = [...allServices, ...pageData]
      hasMorePages = pageData.length === limit
      page++
    } catch (error) {
      // Log a warning and continue to next page. This avoids failing the
      // entire fetch when one page errors (e.g., intermittent network issues).
      console.warn(`Warning: failed to fetch page ${page}, skipping:`, error)
      page++
    }
  }

  return allServices
}

export function clearServicesCache() {
  pageCache.clear()
}

function sanitizeGroupName(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return 'Other'
  const firstToken = trimmed
    .replace(/\[/g, ' ')
    .replace(/\]/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')[0]

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

  // Helper: detect platform from name or category using keywords.
  function detectPlatform(svc: ApiServiceItem): string | null {
    const hay = `${svc.category || ''} ${svc.name || ''}`.toLowerCase()
    
    // More comprehensive platform detection
    if (/tiktok|tiktok\.com/.test(hay)) return 'TikTok'
    if (/facebook|fb\.com|facebook\.com/.test(hay)) return 'Facebook'
    if (/instagram|ig\.com|instagram\.com/.test(hay)) return 'Instagram'
    if (/youtube|yt\.com|youtube\.com|youtu\.be/.test(hay)) return 'YouTube'
    if (/telegram|t\.me|telegram\.me/.test(hay)) return 'Telegram'
    if (/twitter|x\.com|twitter\.com/.test(hay)) return 'Twitter'
    if (/snapchat|snap\.chat|snapchat\.com/.test(hay)) return 'Snapchat'
    if (/rumble|rumble\.com/.test(hay)) return 'Rumble'
    if (/spotify|spotify\.com/.test(hay)) return 'Spotify'
    if (/twitch|twitch\.tv/.test(hay)) return 'Twitch'
    if (/linkedin|linkedin\.com/.test(hay)) return 'LinkedIn'
    if (/discord|discord\.com|discord\.gg/.test(hay)) return 'Discord'
    if (/soundcloud|soundcloud\.com/.test(hay)) return 'SoundCloud'
    
    return null
  }

  services.forEach((svc) => {
    // Prefer explicit platform detection from name/category. This avoids
    // creating a "NEW" group when upstream uses "NEW" as a category token.
    const detected = detectPlatform(svc)
    if (detected) {
      if (!groups[detected]) groups[detected] = []
      groups[detected].push(svc)
      return
    }

    // Fallback to previous sanitize logic when no platform keyword found.
    const byCategory = svc.category ? sanitizeGroupName(svc.category) : undefined
    const byName = svc.name ? sanitizeGroupName(svc.name) : 'Other'
    const key = byCategory && byCategory !== 'Other' ? byCategory : byName
    if (!groups[key]) groups[key] = []
    groups[key].push(svc)
  })

  return groups
}
