import { z } from 'zod'
import { router, publicProcedure, staffProcedure } from '../lib/trpc'
import { prisma } from '../lib/prisma'

export const menuRouter = router({
  getAll: publicProcedure
    .query(async () => {
      return prisma.menuItem.findMany({
        where: { available: true },
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ]
      })
    }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return prisma.menuItem.findUnique({
        where: { id: input }
      })
    }),

  getAllForStaff: staffProcedure
    .query(async () => {
      return prisma.menuItem.findMany({
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ]
      })
    }),

  updateAvailability: staffProcedure
    .input(z.object({
      id: z.number(),
      available: z.boolean(),
      reason: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      // Update menu item
      const menuItem = await prisma.menuItem.update({
        where: { id: input.id },
        data: { available: input.available }
      })

      // Log availability change
      await prisma.availabilityLog.create({
        data: {
          menuItemId: input.id,
          available: input.available,
          reason: input.reason
        }
      })

      return menuItem
    }),

  create: staffProcedure
    .input(z.object({
      name: z.string(),
      nameEn: z.string().optional(),
      description: z.string().optional(),
      price: z.number().positive(),
      category: z.enum(['KANOM', 'DRINK']),
      image: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      return prisma.menuItem.create({
        data: input
      })
    }),

  update: staffProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      nameEn: z.string().optional(),
      description: z.string().optional(),
      price: z.number().positive().optional(),
      category: z.enum(['KANOM', 'DRINK']).optional(),
      image: z.string().optional(),
      available: z.boolean().optional()
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      return prisma.menuItem.update({
        where: { id },
        data
      })
    })
})