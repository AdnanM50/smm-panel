import { fetchServicesFromApi } from '../services/service-api'

export interface MassOrderItem {
  serviceId: number
  link: string
  quantity: number
}

export interface MassOrderRequest {
  profit: number
  orders: MassOrderItem[]
}

export interface MassOrderResponse {
  status: string
  message: string
  data?: any
}

const API_BASE_URL = 'https://smm-panel-khan-it.up.railway.app/api'

export async function submitMassOrder(
  orders: MassOrderItem[],
  token: string
): Promise<MassOrderResponse> {
  // Calculate total profit by fetching service rates
  let totalProfit = 0
  
  try {
    // Get all services to calculate profit
    const allServices = await fetchServicesFromApi({
      profit: 10,
      page: 1,
      limit: 1000, // Get more services to find all needed service IDs
      token
    })

    // Create a map of service ID to userRate for quick lookup
    const serviceRateMap = new Map<number, number>()
    allServices.forEach(service => {
      serviceRateMap.set(service.service, service.userRate ?? 0)
    })

    // Calculate total profit (rates are per 1000 units)
    for (const order of orders) {
      const userRate = serviceRateMap.get(order.serviceId)
      if (userRate) {
        totalProfit += (userRate / 1000) * order.quantity
      }
    }

    // Submit the mass order
    const response = await fetch(`${API_BASE_URL}/placeMassOrder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token
      },
      body: JSON.stringify({
        profit: totalProfit,
        orders: orders
      })
    })

    const data = await response.json()
    
    if (response.ok && data.status === 'Success') {
      return {
        status: 'Success',
        message: data.message || 'Mass order placed successfully',
        data: data.data
      }
    } else {
      return {
        status: 'Error',
        message: data.message || 'Failed to place mass order'
      }
    }
  } catch (error) {
    console.error('Mass order error:', error)
    return {
      status: 'Error',
      message: 'Network error while placing mass order'
    }
  }
}

export function parseMassOrderInput(input: string): MassOrderItem[] {
  const orders: MassOrderItem[] = []
  
  // Split by comma to get individual orders
  const orderStrings = input.split(',').map(s => s.trim()).filter(s => s.length > 0)
  
  for (const orderString of orderStrings) {
    // Split by pipe to get service_id | link | quantity
    const parts = orderString.split('|').map(s => s.trim())
    
    if (parts.length === 3) {
      const serviceId = parseInt(parts[0])
      const link = parts[1]
      const quantity = parseInt(parts[2])
      
      if (!isNaN(serviceId) && !isNaN(quantity) && link.length > 0) {
        orders.push({
          serviceId,
          link,
          quantity
        })
      }
    }
  }
  
  return orders
}

export async function calculateTotalProfit(
  orders: MassOrderItem[],
  token: string
): Promise<number> {
  if (orders.length === 0) return 0
  
  try {
    // Get all services to calculate profit
    const allServices = await fetchServicesFromApi({
      profit: 10,
      page: 1,
      limit: 1000,
      token
    })

    // Create a map of service ID to userRate for quick lookup
    const serviceRateMap = new Map<number, number>()
    allServices.forEach(service => {
      serviceRateMap.set(service.service, service?.userRate ?? 0)
    })

    // Calculate total profit (rates are per 1000 units)
    let totalProfit = 0
    for (const order of orders) {
      const userRate = serviceRateMap.get(order.serviceId)
      if (userRate) {
        totalProfit += (userRate / 1000) * order.quantity
      }
    }

    return totalProfit
  } catch (error) {
    console.error('Profit calculation error:', error)
    return 0
  }
}
