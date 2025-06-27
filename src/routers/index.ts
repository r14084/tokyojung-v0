import { router } from '../lib/trpc'
import { authRouter } from './auth'
import { menuRouter } from './menu'
import { ordersRouter } from './orders'
import { reportsRouter } from './reports'
import { userRouter } from './user'

export const appRouter = router({
  auth: authRouter,
  menu: menuRouter,
  orders: ordersRouter,
  reports: reportsRouter,
  user: userRouter
})

export type AppRouter = typeof appRouter