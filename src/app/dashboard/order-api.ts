const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://smm-panel-khan-it.onrender.com/api'

export interface PlaceOrderRequest {
	serviceId: number
	link: string
	profit: number
	quantity: number
}

export interface PlaceOrderResponse {
	success: boolean
	message: string
	order: {
		id: string
		serviceId: number
		serviceName: string
		quantity: number
		charge: number
		status: string
		apiOrderId: string
	}
}

export async function placeNewOrder(
	orderData: PlaceOrderRequest,
	token: string,
	apiBaseUrl: string = DEFAULT_API_BASE_URL
): Promise<PlaceOrderResponse> {
	const response = await fetch(`${apiBaseUrl}/placeNewOrder`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'token': token,
		},
		body: JSON.stringify(orderData),
	})

	if (!response.ok) {
		throw new Error(`Failed to place order (${response.status})`)
	}

	const data: PlaceOrderResponse = await response.json()
	return data
}
