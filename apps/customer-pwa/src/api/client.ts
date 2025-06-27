import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// API Types
export interface MenuItem {
  id: number
  name: string
  nameEn?: string
  description?: string
  price: number
  category: 'KANOM' | 'DRINK'
  image?: string
  available: boolean
}

export interface OrderItem {
  menuItemId: number
  quantity: number
  unitPrice: number
  notes?: string
}

export interface Order {
  id?: number
  queueNumber?: number
  customerName: string
  items: OrderItem[]
  notes?: string
  status?: string
  totalAmount?: number
}

// API Functions
export const menuApi = {
  getAll: async (): Promise<MenuItem[]> => {
    try {
      // Use tRPC endpoint which is working
      const response = await api.get('/api/trpc/menu.getAll?batch=1&input=%7B%7D')
      return response.data?.[0]?.result?.data || []
    } catch (error) {
      console.error('Menu API error:', error)
      return []
    }
  }
}

export const orderApi = {
  create: async (order: Order) => {
    try {
      console.log('Creating order with data:', order)
      
      // Try the correct tRPC format
      const requestData = {
        customerName: order.customerName,
        items: order.items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes || ""
        })),
        notes: order.notes || ""
      }
      
      console.log('Sending request data:', requestData)
      
      const response = await api.post('/api/trpc/orders.create', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Order API response:', response.data)
      
      if (response.data?.result?.data) {
        return {
          status: 'success',
          data: response.data.result.data
        }
      } else if (response.data?.error) {
        throw new Error(response.data.error.message || 'Order creation failed')
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (error: any) {
      console.error('Order creation error:', error)
      console.error('Error response:', error.response?.data)
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message)
      }
      throw error
    }
  },
  
  getById: async (orderId: number) => {
    try {
      const response = await api.get(`/api/trpc/orders.getById?batch=1&input=${orderId}`)
      return response.data?.[0]?.result?.data
    } catch (error) {
      console.error('Get order error:', error)
      throw error
    }
  },

  getByQueueNumber: async (queueNumber: number) => {
    try {
      const response = await api.get(`/api/trpc/orders.getByQueueNumber?batch=1&input=${queueNumber}`)
      return response.data?.[0]?.result?.data
    } catch (error) {
      console.error('Get order by queue error:', error)
      throw error
    }
  }
}