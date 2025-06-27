import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
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
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  email: string
  name: string
  role: 'ADMIN' | 'CASHIER' | 'KITCHEN'
}

export interface Order {
  id: number
  queueNumber: number
  customerName: string
  status: 'PENDING_PAYMENT' | 'PAID' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED'
  totalAmount: number
  notes?: string
  paymentMethod?: 'CASH' | 'CREDIT_CARD' | 'PROMPTPAY'
  processedById?: number
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  processedBy?: User
}

export interface OrderItem {
  id: number
  orderId: number
  menuItemId: number
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
  menuItem: MenuItem
}

export interface TodayStats {
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
}

// API Functions
export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/api/trpc/auth.login?batch=1', {
        "0": {
          json: { email, password }
        }
      })
      return response.data[0].result.data
    } catch (error: any) {
      if (error.response?.data?.[0]?.error) {
        throw new Error(error.response.data[0].error.message)
      }
      throw error
    }
  }
}

export const menuApi = {
  getAll: async (): Promise<MenuItem[]> => {
    try {
      const response = await api.get('/api/trpc/menu.getAllForStaff?batch=1&input=%7B%7D')
      return response.data?.[0]?.result?.data || []
    } catch (error) {
      console.error('Menu API error:', error)
      return []
    }
  },

  updateAvailability: async (id: number, available: boolean, reason?: string) => {
    const response = await api.post('/api/trpc/menu.updateAvailability', {
      json: { id, available, reason }
    })
    return response.data.result.data
  }
}

export const orderApi = {
  getAll: async (): Promise<Order[]> => {
    try {
      const response = await api.get('/api/trpc/orders.getAll?batch=1&input=%7B%7D')
      return response.data?.[0]?.result?.data || []
    } catch (error) {
      console.error('Orders API error:', error)
      return []
    }
  },

  updateStatus: async (id: number, status: string, paymentMethod?: string) => {
    const response = await api.post('/api/trpc/orders.updateStatus', {
      json: { id, status, paymentMethod }
    })
    return response.data.result.data
  },

  getTodayStats: async (): Promise<TodayStats> => {
    try {
      const response = await api.get('/api/trpc/orders.getTodayStats?batch=1&input=%7B%7D')
      return response.data?.[0]?.result?.data || { todayOrders: 0, todayRevenue: 0, pendingOrders: 0 }
    } catch (error) {
      console.error('Stats API error:', error)
      return { todayOrders: 0, todayRevenue: 0, pendingOrders: 0 }
    }
  }
}