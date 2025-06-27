import { router } from '../lib/trpc'
import { authRouter } from './auth'
import { menuRouter } from './menu'
import { ordersRouter } from './orders'

export const appRouter = router({
  auth: authRouter,
  menu: menuRouter,
  orders: ordersRouter
})

export type AppRouter = typeof appRouter