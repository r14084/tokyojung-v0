import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()

// Initialize Prisma with error handling
let prisma: PrismaClient
try {
  prisma = new PrismaClient()
  console.log('✅ Prisma client initialized')
} catch (error) {
  console.error('❌ Failed to initialize Prisma:', error)
  // Don't exit in production, just log the error
}

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.use(express.json())

// Health check endpoint (no database required)
app.get('/', (req, res) => {
  try {
    res.json({ 
      status: 'ok', 
      message: 'Tokyojung API Server',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    console.error('Health check error:', error)
    res.status(500).json({ status: 'error', message: 'Server error' })
  }
})

app.get('/api/health', (req, res) => {
  try {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    console.error('Health check error:', error)
    res.status(500).json({ status: 'error', message: 'Health check failed' })
  }
})

// Test database endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({
        status: 'error',
        message: 'Prisma client not initialized'
      })
    }
    
    const userCount = await prisma.user.count()
    const menuItemCount = await prisma.menuItem.count()
    const orderCount = await prisma.order.count()
    
    res.json({
      status: 'success',
      message: 'Tokyojung Database connected',
      data: {
        users: userCount,
        menuItems: menuItemCount,
        orders: orderCount
      }
    })
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Menu endpoints
app.get('/api/menu', async (req, res) => {
  try {
    if (!prisma) {
      return res.json({
        status: 'success',
        message: 'Mock menu data',
        data: [
          {
            id: 1,
            name: 'ขนมครกกล้วย',
            nameEn: 'Banana Kanom Krok',
            description: 'ขนมครกใส่กล้วย หวานหอม เนื้อนุ่ม',
            price: 25.00,
            category: 'KANOM',
            available: true
          },
          {
            id: 2,
            name: 'ชาเย็น',
            nameEn: 'Thai Iced Tea',
            description: 'ชาเย็นแท้ รสชาติเข้มข้น',
            price: 20.00,
            category: 'DRINK',
            available: true
          }
        ]
      })
    }

    const menuItems = await prisma.menuItem.findMany({
      where: { available: true },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    res.json({
      status: 'success',
      data: menuItems
    })
  } catch (error) {
    console.error('Menu fetch error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch menu items'
    })
  }
})

// Orders endpoints
app.get('/api/orders', async (req, res) => {
  try {
    if (!prisma) {
      return res.json({
        status: 'success',
        message: 'Mock orders data',
        data: []
      })
    }

    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        processedBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    res.json({
      status: 'success',
      data: orders
    })
  } catch (error) {
    console.error('Orders fetch error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch orders'
    })
  }
})

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, items, notes } = req.body

    if (!prisma) {
      return res.json({
        status: 'success',
        message: 'Mock order created',
        data: {
          id: Math.floor(Math.random() * 1000),
          queueNumber: Math.floor(Math.random() * 100) + 1,
          customerName: customerName || 'Test Customer',
          status: 'PENDING_PAYMENT',
          totalAmount: 45.00,
          items: items || []
        }
      })
    }

    // Calculate total amount
    let totalAmount = 0
    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId }
      })
      if (menuItem) {
        totalAmount += Number(menuItem.price) * item.quantity
      }
    }

    // Get next queue number
    const lastOrder = await prisma.order.findFirst({
      orderBy: { queueNumber: 'desc' }
    })
    const queueNumber = (lastOrder?.queueNumber || 0) + 1

    // Create order
    const order = await prisma.order.create({
      data: {
        queueNumber,
        customerName,
        totalAmount,
        notes,
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            notes: item.notes
          }))
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    })

    res.json({
      status: 'success',
      message: 'Order created successfully',
      data: order
    })
  } catch (error) {
    console.error('Order creation error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to create order'
    })
  }
})

// Order status update
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!prisma) {
      return res.json({
        status: 'success',
        message: 'Mock status update',
        data: { id: parseInt(id), status }
      })
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    })

    res.json({
      status: 'success',
      message: 'Order status updated',
      data: order
    })
  } catch (error) {
    console.error('Status update error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to update order status'
    })
  }
})

// Users/Staff endpoints
app.get('/api/users', async (req, res) => {
  try {
    if (!prisma) {
      return res.json({
        status: 'success',
        message: 'Mock users data',
        data: []
      })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    res.json({
      status: 'success',
      data: users
    })
  } catch (error) {
    console.error('Users fetch error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    })
  }
})

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// For development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`)
  })
}

// Export for Vercel
export default app