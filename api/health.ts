import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    const menuCount = await prisma.menuItem.count()
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: '🥞 Tokyojung API Server v3',
      env: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        users: userCount,
        menuItems: menuCount
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
}