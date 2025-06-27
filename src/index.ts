import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import * as trpcExpress from '@trpc/server/adapters/express'
import { createContext } from './lib/context'
import { appRouter } from './routers'
import { prisma } from './lib/prisma'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const server = createServer(app)

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://order.tokyojung.com',
      'https://staff.tokyojung.com'
    ],
    methods: ['GET', 'POST']
  }
})

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://order.tokyojung.com',
    'https://staff.tokyojung.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.use(express.json())

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '🥞 Tokyojung API Server',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  })
})

app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.user.count()
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    console.error('Health check error:', error)
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      timestamp: new Date().toISOString()
    })
  }
})

// tRPC middleware
app.use(
  '/api/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error, type, path, input, ctx, req }) => {
      console.error(`❌ tRPC Error on ${type} ${path}:`, error.message)
      if (process.env.NODE_ENV === 'development') {
        console.error('Input:', input)
        console.error('Stack:', error.stack)
      }
    }
  })
)

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id)

  // Join room for real-time updates
  socket.on('join-staff', () => {
    socket.join('staff')
    console.log('👨‍💼 Staff member joined staff room')
  })

  socket.on('join-customer', (queueNumber) => {
    socket.join(`customer-${queueNumber}`)
    console.log(`👤 Customer joined queue ${queueNumber}`)
  })

  // Handle order status updates
  socket.on('order-status-updated', (data) => {
    // Notify staff
    socket.to('staff').emit('order-updated', data)
    
    // Notify specific customer
    if (data.queueNumber) {
      socket.to(`customer-${data.queueNumber}`).emit('order-status-changed', data)
    }
  })

  // Handle menu availability updates
  socket.on('menu-availability-updated', (data) => {
    // Notify all connected clients
    io.emit('menu-updated', data)
  })

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id)
  })
})

// Legacy REST endpoints for backward compatibility
app.get('/api/menu', async (req, res) => {
  try {
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

app.get('/api/orders', async (req, res) => {
  try {
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

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ Server error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  })
})

// For development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000
  server.listen(PORT, () => {
    console.log(`🚀 Tokyojung API Server started on port ${PORT}`)
    console.log(`📡 tRPC endpoint: http://localhost:${PORT}/api/trpc`)
    console.log(`🔌 WebSocket server ready`)
  })
}

// Export for Vercel
export default app
export { server }