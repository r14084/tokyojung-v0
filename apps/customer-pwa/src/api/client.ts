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

// Mock Data
const mockMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "ขนมครกไส้หมู",
    nameEn: "Pork Kanom Krok",
    description: "ขนมครกไส้หมูสับ เสิร์ฟร้อนๆ หอมหวล",
    price: 45,
    category: 'KANOM',
    available: true
  },
  {
    id: 2,
    name: "ขนมครกไส้กุ้ง",
    nameEn: "Shrimp Kanom Krok", 
    description: "ขนมครกไส้กุ้งสด รสชาติเข้มข้น",
    price: 50,
    category: 'KANOM',
    available: true
  },
  {
    id: 3,
    name: "ขนมครกไส้หอยแครง",
    nameEn: "Cockle Kanom Krok",
    description: "ขนมครกไส้หอยแครงสด หอมกรุ่น",
    price: 48,
    category: 'KANOM',
    available: true
  },
  {
    id: 4,
    name: "น้ำเปล่า",
    nameEn: "Water",
    description: "น้ำดื่มเย็นๆ",
    price: 15,
    category: 'DRINK',
    available: true
  },
  {
    id: 5,
    name: "โค้ก",
    nameEn: "Coke",
    description: "โคคาโคล่าเย็นๆ",
    price: 25,
    category: 'DRINK',
    available: true
  }
]

// API Functions
export const menuApi = {
  getAll: async (): Promise<MenuItem[]> => {
    try {
      console.log('Fetching menu from API:', API_URL)
      // Try API first, fallback to mock data
      const response = await api.get('/api/trpc/menu.getAll?batch=1&input=%7B%7D')
      const apiData = response.data?.[0]?.result?.data || []
      if (apiData.length > 0) {
        return apiData
      }
      throw new Error('No API data')
    } catch (error) {
      console.error('Menu API error, using mock data:', error)
      
      // Get menu items from localStorage and combine with mock menu
      const customMenuItems = JSON.parse(localStorage.getItem('tokyojung_menu') || '[]')
      
      // Combine custom menu items with mock menu items
      const allMenuItems = [...customMenuItems, ...mockMenuItems]
      
      // Remove duplicates based on ID and sort by creation time
      const uniqueMenuItems = allMenuItems.filter((item, index, self) => 
        index === self.findIndex(i => i.id === item.id)
      ).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      
      // Filter only available items for customers
      return uniqueMenuItems.filter(item => item.available !== false)
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
      console.error('Order creation error, using mock order:', error)
      
      // Mock order creation for demo purposes
      const mockOrder = {
        id: Date.now(),
        queueNumber: Math.floor(Math.random() * 100) + 1,
        customerName: order.customerName,
        status: 'PENDING_PAYMENT',
        totalAmount: order.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        notes: order.notes,
        paymentMethod: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: order.items.map(item => {
          const menuItem = mockMenuItems.find(m => m.id === item.menuItemId)
          return {
            id: Date.now() + Math.random(),
            orderId: Date.now(),
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            notes: item.notes || "",
            menuItem: menuItem || mockMenuItems[0]
          }
        })
      }
      
      // Save to localStorage to share with staff dashboard
      const existingOrders = JSON.parse(localStorage.getItem('tokyojung_orders') || '[]')
      existingOrders.push(mockOrder)
      localStorage.setItem('tokyojung_orders', JSON.stringify(existingOrders))
      
      console.log('🍜 Customer PWA: Saved order to localStorage')
      console.log('🍜 Order saved:', mockOrder)
      console.log('🍜 Total orders in localStorage:', existingOrders.length)
      
      return {
        status: 'success',
        data: mockOrder
      }
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