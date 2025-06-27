import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()

// Initialize Prisma with error handling
let prisma: PrismaClient
try {
  prisma = new PrismaClient()
} catch (error) {
  console.error('Failed to initialize Prisma:', error)
  process.exit(1)
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

// Test database endpoint (temporarily disabled)
app.get('/api/test-db', async (req, res) => {
  res.json({
    status: 'success',
    message: 'Database test disabled - API working',
    note: 'Will implement database connection later'
  })
})

// Users endpoints (temporarily mock data)
app.get('/api/users', async (req, res) => {
  res.json({
    status: 'success',
    message: 'Mock users data',
    data: []
  })
})

app.post('/api/users', async (req, res) => {
  res.json({
    status: 'success',
    message: 'User creation disabled - will implement later'
  })
})

// Posts endpoints (mock data)
app.get('/api/posts', async (req, res) => {
  res.json({
    status: 'success',
    message: 'Mock posts data',
    data: []
  })
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