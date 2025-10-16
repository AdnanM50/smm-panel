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
  token?: string
  apiBaseUrl?: string
}

const DEFAULT_API_BASE_URL = 'https://smm-panel-khan-it.onrender.com/api'

export async function fetchServicesFromApi({
  profit = 10,
  token,
  apiBaseUrl = DEFAULT_API_BASE_URL,
}: FetchServicesParams): Promise<ApiServiceItem[]> {
  const response = await fetch(`${apiBaseUrl}/getServicesFromAPI`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { token } : {}),
    },
    body: JSON.stringify({ profit }),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch services (${response.status})`)
  }

  const data = await response.json()
  if (!data || !data.services) {
    return []
  }

  return data.services as ApiServiceItem[]
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


