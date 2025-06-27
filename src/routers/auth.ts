import { z } from 'zod'
import { router, publicProcedure } from '../lib/trpc'
import { authenticateUser } from '../lib/auth'

export const authRouter = router({
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(1)
    }))
    .mutation(async ({ input }) => {
      return authenticateUser(input.email, input.password)
    }),

  me: publicProcedure
    .query(({ ctx }) => {
      if (!ctx.user) {
        return null
      }
      return ctx.user
    })
})