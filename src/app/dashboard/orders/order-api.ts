export interface Order {
  _id: string
  email: string
  serviceId: number
  serviceName: string
  link: string
  quantity: number
  charge: number
  actualCharge: number
  profit: number
  apiOrderId: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface OrdersResponse {
  success: boolean
  orders: Order[]
  message?: string
}

export interface CancelOrdersResponse {
  status: string
  message: string
  data?: any
}

const API_BASE_URL = 'https://smm-panel-khan-it.onrender.com/api'

export async function getUserOrders(token: string): Promise<Order[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/getUserOrders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        token,
      },
      next: { revalidate: 60 }
    })

    const data: OrdersResponse = await response.json()
    
    if (response.ok && data.success && Array.isArray(data.orders)) {
      return data.orders
    } else {
      throw new Error(data.message || 'Failed to fetch orders')
    }
  } catch (error) {
    console.error('Get user orders error:', error)
    throw error
  }
}

export async function cancelOrders(orderIds: string[], token: string): Promise<CancelOrdersResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/cancelOrders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token,
      },
      body: JSON.stringify({
        orderIds: orderIds
      })
    })

    const data = await response.json()
    
    if (response.ok && data.status === 'Success') {
      return {
        status: 'Success',
        message: data.message || 'Orders cancelled successfully',
        data: data.data
      }
    } else {
      return {
        status: 'Error',
        message: data.message || 'Failed to cancel orders'
      }
    }
  } catch (error) {
    console.error('Cancel orders error:', error)
    return {
      status: 'Error',
      message: 'Network error while cancelling orders'
    }
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20'
    case 'processing':
      return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20'
    case 'pending':
      return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/20'
    case 'cancelled':
      return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20'
    case 'partial':
      return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/20'
    default:
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/20'
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}
