import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://tokyojung-v0-01.vercel.app'
console.log('🔧 Staff Dashboard API URL:', API_URL)
console.log('🔧 Environment variables:', import.meta.env)

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

// Mock Data
const mockMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "ขนมครกไส้หมู",
    nameEn: "Pork Kanom Krok",
    description: "ขนมครกไส้หมูสับ เสิร์ฟร้อนๆ หอมหวล",
    price: 45,
    category: 'KANOM',
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "ขนมครกไส้กุ้ง",
    nameEn: "Shrimp Kanom Krok", 
    description: "ขนมครกไส้กุ้งสด รสชาติเข้มข้น",
    price: 50,
    category: 'KANOM',
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "ขนมครกไส้หอยแครง",
    nameEn: "Cockle Kanom Krok",
    description: "ขนมครกไส้หอยแครงสด หอมกรุ่น",
    price: 48,
    category: 'KANOM',
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    name: "น้ำเปล่า",
    nameEn: "Water",
    description: "น้ำดื่มเย็นๆ",
    price: 15,
    category: 'DRINK',
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    name: "โค้ก",
    nameEn: "Coke",
    description: "โคคาโคล่าเย็นๆ",
    price: 25,
    category: 'DRINK',
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const mockOrders: Order[] = [
  {
    id: 1,
    queueNumber: 1,
    customerName: "ลูกค้า A",
    status: 'PREPARING',
    totalAmount: 95,
    notes: "ไม่ใส่ผัก",
    paymentMethod: 'CASH',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 1,
        orderId: 1,
        menuItemId: 1,
        quantity: 2,
        unitPrice: 45,
        totalPrice: 90,
        notes: "",
        menuItem: mockMenuItems[0]
      },
      {
        id: 2,
        orderId: 1,
        menuItemId: 4,
        quantity: 1,
        unitPrice: 15,
        totalPrice: 15,
        notes: "",
        menuItem: mockMenuItems[3]
      }
    ]
  },
  {
    id: 2,
    queueNumber: 2,
    customerName: "ลูกค้า B",
    status: 'PAID',
    totalAmount: 50,
    paymentMethod: 'PROMPTPAY',
    createdAt: new Date(Date.now() - 10000).toISOString(),
    updatedAt: new Date(Date.now() - 10000).toISOString(),
    items: [
      {
        id: 3,
        orderId: 2,
        menuItemId: 2,
        quantity: 1,
        unitPrice: 50,
        totalPrice: 50,
        notes: "เผ็ดน้อย",
        menuItem: mockMenuItems[1]
      }
    ]
  }
]

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
      console.error('Login error, using mock auth:', error)
      // Mock authentication for demo purposes
      const mockUser = {
        user: {
          id: 1,
          email: email,
          name: 'Demo Staff',
          role: 'ADMIN' as const
        },
        token: 'mock-jwt-token'
      }
      return mockUser
    }
  }
}

export const menuApi = {
  getAll: async (): Promise<MenuItem[]> => {
    try {
      console.log('📦 Staff Dashboard: Loading menu from API')
      const response = await api.get('/api/trpc/menu.getAllForStaff?batch=1&input=%7B%7D')
      const apiData = response.data?.[0]?.result?.data || []
      return apiData
    } catch (error) {
      console.error('📦 Staff Dashboard: Error loading menu from API:', error)
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
      console.error('API: Create menu error, using mock creation:', error)
      
      // Mock menu creation for demo purposes
      const newMenuItem = {
        id: Date.now(),
        name: menuData.name,
        nameEn: menuData.nameEn,
        description: menuData.description,
        price: menuData.price,
        category: menuData.category,
        image: menuData.image,
        available: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Save to localStorage
      const existingMenuItems = JSON.parse(localStorage.getItem('tokyojung_menu') || '[]')
      existingMenuItems.push(newMenuItem)
      localStorage.setItem('tokyojung_menu', JSON.stringify(existingMenuItems))
      
      return newMenuItem
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
      console.log('📦 Staff Dashboard: Loading orders from API')
      const response = await api.get('/api/trpc/orders.getAll?batch=1&input=%7B%7D')
      const apiData = response.data?.[0]?.result?.data || []
      console.log('📦 Staff Dashboard: Loaded', apiData.length, 'orders from API')
      return apiData
    } catch (error) {
      console.error('📦 Staff Dashboard: Error loading orders from API:', error)
      return []
    }
  },

  updateStatus: async (id: number, status: string, paymentMethod?: string) => {
    try {
      const response = await api.post('/api/trpc/orders.updateStatus', {
        id, status, paymentMethod
      })
      return response.data.result.data
    } catch (error) {
      console.error('Update status API error:', error)
      throw error
    }
  },

  getTodayStats: async (): Promise<TodayStats> => {
    try {
      console.log('📦 Staff Dashboard: Loading stats from API')
      const response = await api.get('/api/trpc/orders.getTodayStats?batch=1&input=%7B%7D')
      const apiData = response.data?.[0]?.result?.data
      if (apiData) {
        return apiData
      }
      throw new Error('No API data')
    } catch (error) {
      console.error('📦 Staff Dashboard: Error loading stats from API:', error)
      return {
        todayOrders: 0,
        todayRevenue: 0,
        pendingOrders: 0
      }
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
      // Use simple tRPC mutation format
      const response = await api.post('/api/trpc/reports.exportReport', {
        period, format
      })
      
      if (response.data?.result?.data) {
        let blob: Blob
        
        if (format === 'csv') {
          // For CSV, the data is a string
          blob = new Blob([response.data.result.data], {
            type: 'text/csv;charset=utf-8'
          })
        } else {
          // For PDF, the data is base64 encoded
          const binaryString = atob(response.data.result.data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          blob = new Blob([bytes], {
            type: 'application/pdf'
          })
        }
        
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `tokyojung-report-${period}.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        return true
      }
      return false
    } catch (error) {
      console.error('Export report error, generating mock export:', error)
      
      // Generate export data from real orders only
      const cookieName = 'tokyojung_shared_orders'
      const existingCookie = document.cookie.split('; ').find(row => row.startsWith(cookieName + '='))
      const cookieOrders = existingCookie ? JSON.parse(decodeURIComponent(existingCookie.split('=')[1])) : []
      const localOrders = JSON.parse(localStorage.getItem('tokyojung_orders') || '[]')
      
      // Combine both sources and remove duplicates
      const allOrdersArray = [...cookieOrders, ...localOrders]
      const allOrders = allOrdersArray.filter((order, index, self) => 
        index === self.findIndex(o => o.id === order.id)
      )
      
      if (format === 'csv') {
        // Generate CSV data
        const csvHeader = 'Queue Number,Customer Name,Status,Total Amount,Payment Method,Created At,Items\n'
        const csvRows = allOrders.map(order => {
          const itemsStr = order.items.map((item: any) => `${item.menuItem.name} x${item.quantity}`).join('; ')
          return `${order.queueNumber},"${order.customerName}",${order.status},${order.totalAmount},${order.paymentMethod || 'N/A'},"${new Date(order.createdAt).toLocaleString()}","${itemsStr}"`
        }).join('\n')
        
        const csvContent = csvHeader + csvRows
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `tokyojung-report-${period}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        return true
      } else {
        // For PDF, create a simple text representation
        alert('PDF export ไม่สามารถใช้งานได้ในโหมด Demo โปรดใช้ CSV export แทน')
        return false
      }
    }
  }
}

export const userApi = {
  getProfile: async () => {
    try {
      const response = await api.get('/api/trpc/user.getProfile?batch=1&input=%7B%7D')
      return response.data?.[0]?.result?.data
    } catch (error) {
      console.error('Get profile error:', error)
      throw error
    }
  },

  updateProfile: async (profileData: { name?: string; email?: string }) => {
    try {
      const response = await api.post('/api/trpc/user.updateProfile', profileData)
      
      if (response.data?.result?.data) {
        return response.data.result.data
      } else if (response.data?.error) {
        throw new Error(response.data.error.message || 'Profile update failed')
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (error: any) {
      console.error('Update profile error:', error)
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message)
      }
      throw error
    }
  },

  changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    try {
      const response = await api.post('/api/trpc/user.changePassword', passwordData)
      
      if (response.data?.result?.data) {
        return response.data.result.data
      } else if (response.data?.error) {
        throw new Error(response.data.error.message || 'Password change failed')
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (error: any) {
      console.error('Change password error:', error)
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message)
      }
      throw error
    }
  }
}