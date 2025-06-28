import { VercelRequest, VercelResponse } from '@vercel/node'
import * as trpcExpress from '@trpc/server/adapters/express'
import { appRouter } from '../../src/routers'
import { createContext } from '../../src/lib/context'

const handler = trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,
  onError: ({ error, type, path, input }) => {
    console.error(`❌ tRPC Error on ${type} ${path}:`, error.message)
    if (process.env.NODE_ENV === 'development') {
      console.error('Input:', input)
      console.error('Stack:', error.stack)
    }
  }
})

export default async function trpcHandler(req: VercelRequest, res: VercelResponse) {
  try {
    // Create Express-like request/response objects
    const expressReq = req as any
    const expressRes = res as any
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    
    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }
    
    await handler(expressReq, expressRes)
  } catch (error) {
    console.error('tRPC handler error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    })
  }
}