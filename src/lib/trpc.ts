import { initTRPC, TRPCError } from '@trpc/server'
import { Context } from './context'

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  })
})

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({ ctx })
})

export const staffProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!['ADMIN', 'CASHIER', 'KITCHEN'].includes(ctx.user.role)) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({ ctx })
})