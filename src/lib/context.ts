import { inferAsyncReturnType } from '@trpc/server'
import { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { verifyToken, JWTPayload } from './auth'

export const createContext = ({ req, res }: CreateExpressContextOptions) => {
  const getUser = (): JWTPayload | null => {
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
    res,
    user: getUser()
  }
}

export type Context = inferAsyncReturnType<typeof createContext>