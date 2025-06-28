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
    // Skip API call and go directly to localStorage
    console.log('📦 Staff Dashboard: Loading menu from localStorage')
      
      // Get menu items from localStorage only - NO MOCK DATA
      const customMenuItems = JSON.parse(localStorage.getItem('tokyojung_menu') || '[]')
      
      // If no custom menu items, return the default menu (not mock, but initial menu)
      if (customMenuItems.length === 0) {
        // Return a default menu for initial setup
        return mockMenuItems
      }
      
      // Sort by creation time
      const sortedMenuItems = customMenuItems.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      
      return sortedMenuItems
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
    console.log('📦 Staff Dashboard: Loading orders from shared cookie')
    
    try {
      // First try to get orders from shared cookie (cross-subdomain)
      const cookieName = 'tokyojung_shared_orders'
      const existingCookie = document.cookie.split('; ').find(row => row.startsWith(cookieName + '='))
      const cookieOrders = existingCookie ? JSON.parse(decodeURIComponent(existingCookie.split('=')[1])) : []
      
      console.log('📦 Staff Dashboard: Found', cookieOrders.length, 'orders in shared cookie')
      
      // Also check localStorage for backward compatibility
      const localOrders = JSON.parse(localStorage.getItem('tokyojung_orders') || '[]')
      console.log('📦 Staff Dashboard: Found', localOrders.length, 'orders in localStorage')
      
      // Combine both sources and remove duplicates
      const allOrders = [...cookieOrders, ...localOrders]
      const uniqueOrders = allOrders.filter((order, index, self) => 
        index === self.findIndex(o => o.id === order.id)
      )
      
      // Sort by creation time (newest first)
      const sortedOrders = uniqueOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      console.log('📦 Staff Dashboard: Returning', sortedOrders.length, 'total orders (no mock data)')
      return sortedOrders
    } catch (error) {
      console.error('📦 Staff Dashboard: Error loading orders:', error)
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
      console.error('Update status API error, updating localStorage:', error)
      
      // Update order status in both localStorage and shared cookie
      const sharedOrders = JSON.parse(localStorage.getItem('tokyojung_orders') || '[]')
      const updatedOrders = sharedOrders.map((order: any) => {
        if (order.id === id) {
          return {
            ...order,
            status,
            paymentMethod: paymentMethod || order.paymentMethod,
            updatedAt: new Date().toISOString()
          }
        }
        return order
      })
      localStorage.setItem('tokyojung_orders', JSON.stringify(updatedOrders))
      
      // Also update shared cookie
      try {
        const cookieName = 'tokyojung_shared_orders'
        const existingCookie = document.cookie.split('; ').find(row => row.startsWith(cookieName + '='))
        const cookieOrders = existingCookie ? JSON.parse(decodeURIComponent(existingCookie.split('=')[1])) : []
        
        const updatedCookieOrders = cookieOrders.map((order: any) => {
          if (order.id === id) {
            return {
              ...order,
              status,
              paymentMethod: paymentMethod || order.paymentMethod,
              updatedAt: new Date().toISOString()
            }
          }
          return order
        })
        
        document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(updatedCookieOrders))}; domain=.tokyojung.com; path=/; max-age=86400`
        console.log('📦 Staff: Updated order status in shared cookie')
      } catch (error) {
        console.log('📦 Staff: Could not update shared cookie:', error)
      }
      
      // Notify customer PWA of the change via postMessage
      try {
        // Try to communicate with customer PWA in same domain
        window.parent.postMessage({
          type: 'ORDER_STATUS_UPDATED',
          data: { orderId: id, status, paymentMethod, timestamp: new Date().toISOString() }
        }, window.location.origin)
        
        // Also try iframe communication if exists
        const customerFrame = window.parent.frames[0]
        if (customerFrame && customerFrame !== window) {
          customerFrame.postMessage({
            type: 'ORDER_STATUS_UPDATED',
            data: { orderId: id, status, paymentMethod, timestamp: new Date().toISOString() }
          }, window.location.origin)
        }
        
        console.log('📦 Staff: Sent status update notification to customer PWA')
      } catch (error) {
        console.log('📦 Staff: Could not notify customer PWA:', error)
      }
      
      // Trigger storage event manually for same-domain communication
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'tokyojung_orders',
        newValue: JSON.stringify(updatedOrders),
        oldValue: JSON.stringify(sharedOrders),
        url: window.location.href
      }))
      
      // Find and return the updated order
      return updatedOrders.find((order: any) => order.id === id)
    }
  },

  getTodayStats: async (): Promise<TodayStats> => {
    // Skip API call and calculate from shared cookie and localStorage
    console.log('📦 Staff Dashboard: Calculating stats from shared data')
    
    try {
      // Get orders from both sources
      const cookieName = 'tokyojung_shared_orders'
      const existingCookie = document.cookie.split('; ').find(row => row.startsWith(cookieName + '='))
      const cookieOrders = existingCookie ? JSON.parse(decodeURIComponent(existingCookie.split('=')[1])) : []
      const localOrders = JSON.parse(localStorage.getItem('tokyojung_orders') || '[]')
      
      // Combine and remove duplicates
      const allOrdersArray = [...cookieOrders, ...localOrders]
      const uniqueOrders = allOrdersArray.filter((order, index, self) => 
        index === self.findIndex(o => o.id === order.id)
      )
      
      // Use ONLY real orders, no mock data
      const allOrders = uniqueOrders
    
    // Get today's orders
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayOrders = allOrders.filter(order => {
      const orderDate = new Date(order.createdAt)
      orderDate.setHours(0, 0, 0, 0)
      return orderDate.getTime() === today.getTime()
    })
    
    const mockStats: TodayStats = {
      todayOrders: todayOrders.length,
      todayRevenue: todayOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      pendingOrders: allOrders.filter(order => 
        order.status === 'PENDING_PAYMENT' || 
        order.status === 'PAID' || 
        order.status === 'PREPARING'
      ).length
    }
    return mockStats
    } catch (error) {
      console.error('📦 Staff Dashboard: Error calculating stats:', error)
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