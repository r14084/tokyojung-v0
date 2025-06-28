import { VercelRequest, VercelResponse } from '@vercel/node'
import * as trpcExpress from '@trpc/server/adapters/express'
import { appRouter } from '../../src/routers'
import { createContext } from '../../src/lib/context'
import cors from 'cors'

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'http://localhost:5174',
    'https://order.tokyojung.com',
    'https://staff.tokyojung.com',
    'https://tokyojung-v0-01.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  const corsHandler = cors(corsOptions)
  await new Promise((resolve, reject) => {
    corsHandler(req as any, res as any, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Create tRPC handler
  const trpcHandler = trpcExpress.createExpressMiddleware({
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

  return trpcHandler(req as any, res as any)
}