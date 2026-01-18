import { getUserOrders } from '@/app/dashboard/orders/order-api'

const API_BASE_URL = 'https://smm-panel-khan-it.vercel.app/api'

export interface CreateTicketPayload {
  subject: string
  message: string
  apiOrderId: string
}

export interface CreateTicketResponse {
  success: boolean
  message?: string
  data?: any
}

export interface Ticket {
  _id: string
  userEmail?: string
  orderId: string
  subject: string
  message: string
  status?: string
  replies?: any[]
  createdAt?: string
  updatedAt?: string
}

export interface GetMyTicketsResponse {
  success: boolean
  tickets: Ticket[]
  message?: string
}

export interface ReplyToTicketResponse {
  success: boolean
  message?: string
  data?: any
}

/**
 * Create a ticket for a user's order. This will:
 * - fetch the user's orders using the provided token
 * - find the order whose apiOrderId matches the provided apiOrderId
 * - post to /createTicket using the matched order's internal _id as orderId
 */
export async function createTicket(payload: CreateTicketPayload, token: string): Promise<CreateTicketResponse> {
  try {
    // Fetch user orders to map apiOrderId -> internal _id
    const orders = await getUserOrders(token)

    const matched = orders.find(o => o.apiOrderId === payload.apiOrderId)

    if (!matched) {
      return { success: false, message: `Order with apiOrderId ${payload.apiOrderId} not found` }
    }

    const body = {
      subject: payload.subject,
      message: payload.message,
      orderId: matched._id,
    }

    const res = await fetch(`${API_BASE_URL}/createTicket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return { success: false, message: data.message || `Create ticket failed (${res.status})`, data }
    }

    return { success: true, message: data.message || 'Ticket created', data }
  } catch (error: any) {
    console.error('createTicket error:', error)
    return { success: false, message: error?.message || 'Network error while creating ticket' }
  }
}

export async function getMyTickets(token: string): Promise<GetMyTicketsResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/getMyTickets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        token,
      },
      next: { revalidate: 60 }
    })

    const data = await res.json()

    if (!res.ok) {
      return { success: false, tickets: [], message: data.message || `Failed (${res.status})` }
    }

    return { success: true, tickets: Array.isArray(data.tickets) ? data.tickets : [], message: data.message }
  } catch (error: any) {
    console.error('getMyTickets error:', error)
    return { success: false, tickets: [], message: error?.message || 'Network error' }
  }
}

export async function replyToTicket(ticketId: string, message: string, token: string): Promise<ReplyToTicketResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/replyToTicket/${ticketId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token,
      },
      body: JSON.stringify({ message }),
    })

    const data = await res.json()

    if (!res.ok) {
      return { success: false, message: data?.message || `Failed (${res.status})`, data }
    }

    return { success: data?.success !== false, message: data?.message, data }
  } catch (error: any) {
    console.error('replyToTicket error:', error)
    return { success: false, message: error?.message || 'Network error while replying' }
  }
}
