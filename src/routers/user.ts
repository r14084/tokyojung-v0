import { z } from 'zod'
import { router, staffProcedure } from '../lib/trpc'
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

export const userRouter = router({
  updateProfile: staffProcedure
    .input(z.object({
      name: z.string().optional(),
      email: z.string().email().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user!.userId

      // Check if email is already taken by another user
      if (input.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: input.email,
            id: { not: userId }
          }
        })
        if (existingUser) {
          throw new Error('อีเมลนี้ถูกใช้งานแล้ว')
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.email && { email: input.email })
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      })

      return updatedUser
    }),

  changePassword: staffProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(6)
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user!.userId

      // Get current user with password
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        throw new Error('ไม่พบผู้ใช้')
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(input.currentPassword, user.password)
      if (!isValidPassword) {
        throw new Error('รหัสผ่านปัจจุบันไม่ถูกต้อง')
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(input.newPassword, 10)

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      })

      return { success: true }
    }),

  getProfile: staffProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user!.userId

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      })

      if (!user) {
        throw new Error('ไม่พบผู้ใช้')
      }

      return user
    })
})