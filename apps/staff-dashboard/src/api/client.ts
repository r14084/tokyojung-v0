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

export interface ReportData {
  period: string
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  topItems: Array<{
    name: string
    quantity: number
    revenue: number
  }>
}

export interface DailyReport {
  date: string
  orders: number
  revenue: number
  averageOrderValue: number
}

export interface MenuItemReport {
  id: number
  name: string
  category: string
  totalQuantity: number
  totalRevenue: number
  orderCount: number
}

// API Functions
export const authApi = {
  login: async (email: string, password: string) => {
    try {
      // Use the correct tRPC format for mutations
      const response = await api.post('/api/trpc/auth.login', {
        email,
        password
      })
      
      if (response.data?.result?.data) {
        return response.data.result.data
      } else if (response.data?.error) {
        throw new Error(response.data.error.message || 'Login failed')
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message)
      }
      if (error.message) {
        throw error
      }
      throw new Error('การเข้าสู่ระบบล้มเหลว กรุณาลองใหม่')
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
      id, available, reason
    })
    return response.data.result.data
  },

  create: async (menuData: {
    name: string
    nameEn?: string
    description?: string
    price: number
    category: 'KANOM' | 'DRINK'
    image?: string
  }) => {
    try {
      console.log('API: Sending create request with data:', menuData)
      const response = await api.post('/api/trpc/menu.create', menuData)
      console.log('API: Create response:', response.data)
      
      if (response.data?.result?.data) {
        return response.data.result.data
      } else if (response.data?.error) {
        throw new Error(response.data.error.message || 'Menu creation failed')
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (error: any) {
      console.error('API: Create menu error:', error)
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message)
      }
      throw error
    }
  },

  update: async (id: number, menuData: {
    name?: string
    nameEn?: string
    description?: string
    price?: number
    category?: 'KANOM' | 'DRINK'
    image?: string
  }) => {
    try {
      const response = await api.post('/api/trpc/menu.update', {
        id, ...menuData
      })
      
      if (response.data?.result?.data) {
        return response.data.result.data
      } else if (response.data?.error) {
        throw new Error(response.data.error.message || 'Menu update failed')
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (error: any) {
      console.error('API: Update menu error:', error)
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message)
      }
      throw error
    }
  },

  delete: async (id: number) => {
    try {
      const response = await api.post('/api/trpc/menu.delete', { id })
      
      if (response.data?.result?.data !== undefined) {
        return response.data.result.data
      } else if (response.data?.error) {
        throw new Error(response.data.error.message || 'Menu deletion failed')
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (error: any) {
      console.error('API: Delete menu error:', error)
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message)
      }
      throw error
    }
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
      id, status, paymentMethod
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

export const reportsApi = {
  getDailyReports: async (days: number = 7): Promise<DailyReport[]> => {
    try {
      const response = await api.get(`/api/trpc/reports.getDailyReports?batch=1&input=${encodeURIComponent(JSON.stringify({ days }))}`)
      return response.data?.[0]?.result?.data || []
    } catch (error) {
      console.error('Daily reports API error:', error)
      return []
    }
  },

  getMenuItemReports: async (period: string = '7d'): Promise<MenuItemReport[]> => {
    try {
      const response = await api.get(`/api/trpc/reports.getMenuItemReports?batch=1&input=${encodeURIComponent(JSON.stringify({ period }))}`)
      return response.data?.[0]?.result?.data || []
    } catch (error) {
      console.error('Menu item reports API error:', error)
      return []
    }
  },

  getPeriodReport: async (period: string = '7d'): Promise<ReportData> => {
    try {
      const response = await api.get(`/api/trpc/reports.getPeriodReport?batch=1&input=${encodeURIComponent(JSON.stringify({ period }))}`)
      return response.data?.[0]?.result?.data || {
        period,
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        topItems: []
      }
    } catch (error) {
      console.error('Period report API error:', error)
      return {
        period,
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        topItems: []
      }
    }
  },

  exportReport: async (period: string, format: 'csv' | 'pdf' = 'csv') => {
    try {
      const response = await api.post('/api/trpc/reports.exportReport', {
        period, format
      })
      
      if (response.data?.result?.data) {
        // Create download link
        const blob = new Blob([response.data.result.data], {
          type: format === 'csv' ? 'text/csv' : 'application/pdf'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `tokyojung-report-${period}.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export report error:', error)
      throw error
    }
  }
}