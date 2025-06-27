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
    const response = await api.post('/api/orders', order)
    return response.data
  },
  
  getAll: async () => {
    const response = await api.get('/api/orders')
    return response.data.data || []
  }
}