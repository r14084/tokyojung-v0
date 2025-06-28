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
      const response = await api.get('/api/trpc/menu.getAll?batch=1&input=%7B%7D')
      const apiData = response.data?.[0]?.result?.data || []
      return apiData.filter((item: MenuItem) => item.available)
    } catch (error) {
      console.error('Menu API error:', error)
      // Return empty array on error instead of mock data
      return []
    }
  }
}

export const orderApi = {
  create: async (order: Order) => {
    try {
      console.log('Creating order with data:', order)
      
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
      
      const response = await api.post('/api/trpc/orders.create', requestData)
      
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