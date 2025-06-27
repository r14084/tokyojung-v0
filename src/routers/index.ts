import { router } from '../lib/trpc'
import { authRouter } from './auth'
import { menuRouter } from './menu'
import { ordersRouter } from './orders'
import { reportsRouter } from './reports'

export const appRouter = router({
  auth: authRouter,
  menu: menuRouter,
  orders: ordersRouter,
  reports: reportsRouter
})

export type AppRouter = typeof appRouter