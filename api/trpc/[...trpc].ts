import { VercelRequest, VercelResponse } from '@vercel/node'
import { TRPCError } from '@trpc/server'
import { appRouter } from '../../src/routers'
import { verifyToken } from '../../src/lib/auth'

// Create context for tRPC procedures
const createContext = (req: VercelRequest) => {
  const getUser = () => {
    const authHeader = req.headers.authorization
    if (!authHeader) return null

    try {
      const token = authHeader.split(' ')[1]
      return verifyToken(token)
    } catch {
      return null
    }
  }

  return {
    req,
    user: getUser()
  }
}

export default async function trpcHandler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  try {
    // Parse tRPC path from URL
    const url = req.url || ''
    const pathMatch = url.match(/\/api\/trpc\/(.+)/)
    
    if (!pathMatch) {
      res.status(404).json({ error: 'Invalid tRPC path', url })
      return
    }
    
    let path = pathMatch[1]
    // Remove query parameters from path
    path = path.split('?')[0]
    
    const ctx = createContext(req)
    
    // Handle batch requests
    if (url.includes('batch=1')) {
      const caller = appRouter.createCaller(ctx)
      const urlParams = new URLSearchParams(url.split('?')[1])
      const inputParam = urlParams.get('input')
      
      if (inputParam) {
        const input = JSON.parse(decodeURIComponent(inputParam))
        
        // Handle getTodayStats
        if (url.includes('orders.getTodayStats')) {
          const result = await caller.orders.getTodayStats()
          res.json([{ result: { data: result } }])
          return
        }
        
        // Handle getAll orders
        if (url.includes('orders.getAll')) {
          const result = await caller.orders.getAll(input)
          res.json([{ result: { data: result } }])
          return
        }
      }
    }
    
    // Handle individual procedures
    const [router, procedure] = path.split('.')
    
    const caller = appRouter.createCaller(ctx)
    
    if (router === 'auth' && procedure === 'login' && req.method === 'POST') {
      const result = await caller.auth.login(req.body)
      res.json({ result: { data: result } })
    } else if (router === 'auth' && procedure === 'me') {
      const result = await caller.auth.me()
      res.json({ result: { data: result } })
    } else if (router === 'menu' && procedure === 'getAll') {
      const result = await caller.menu.getAll()
      res.json({ result: { data: result } })
    } else if (router === 'orders' && procedure === 'getAll') {
      const result = await caller.orders.getAll(req.query)
      res.json({ result: { data: result } })
    } else if (router === 'orders' && procedure === 'getTodayStats') {
      const result = await caller.orders.getTodayStats()
      res.json({ result: { data: result } })
    } else {
      res.status(404).json({ error: 'Procedure not found', path, router, procedure })
    }
  } catch (error: any) {
    console.error('tRPC handler error:', error)
    
    if (error instanceof TRPCError) {
      const statusCode = error.code === 'UNAUTHORIZED' ? 401 : 
                        error.code === 'FORBIDDEN' ? 403 :
                        error.code === 'NOT_FOUND' ? 404 : 500
      
      res.status(statusCode).json({ 
        error: { 
          code: error.code,
          message: error.message
        },
        timestamp: new Date().toISOString()
      })
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }
}