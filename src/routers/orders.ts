import { z } from 'zod'
import { router, publicProcedure, staffProcedure } from '../lib/trpc'
import { prisma } from '../lib/prisma'

const orderItemSchema = z.object({
  menuItemId: z.number(),
  quantity: z.number().positive(),
  notes: z.string().optional()
})

export const ordersRouter = router({
  create: publicProcedure
    .input(z.object({
      customerName: z.string().min(1),
      items: z.array(orderItemSchema),
      notes: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      // Calculate total amount
      let totalAmount = 0
      const itemsWithPrices = []

      for (const item of input.items) {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId }
        })
        
        if (!menuItem) {
          throw new Error(`Menu item ${item.menuItemId} not found`)
        }

        if (!menuItem.available) {
          throw new Error(`Menu item ${menuItem.name} is not available`)
        }

        const itemTotal = Number(menuItem.price) * item.quantity
        totalAmount += itemTotal

        itemsWithPrices.push({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: Number(menuItem.price),
          totalPrice: itemTotal,
          notes: item.notes
        })
      }

      // Get next queue number
      const lastOrder = await prisma.order.findFirst({
        orderBy: { queueNumber: 'desc' }
      })
      const queueNumber = (lastOrder?.queueNumber || 0) + 1

      // Create order
      const order = await prisma.order.create({
        data: {
          queueNumber,
          customerName: input.customerName,
          totalAmount,
          notes: input.notes,
          items: {
            create: itemsWithPrices
          }
        },
        include: {
          items: {
            include: {
              menuItem: true
            }
          }
        }
      })

      return order
    }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return prisma.order.findUnique({
        where: { id: input },
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          processedBy: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        }
      })
    }),

  getByQueueNumber: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return prisma.order.findFirst({
        where: { queueNumber: input },
        include: {
          items: {
            include: {
              menuItem: true
            }
          }
        }
      })
    }),

  getAll: staffProcedure
    .input(z.object({
      status: z.enum(['PENDING_PAYMENT', 'PAID', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']).optional(),
      limit: z.number().optional().default(50)
    }))
    .query(async ({ input }) => {
      return prisma.order.findMany({
        where: input.status ? { status: input.status } : undefined,
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          processedBy: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit
      })
    }),

  updateStatus: staffProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['PENDING_PAYMENT', 'PAID', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
      paymentMethod: z.enum(['CASH', 'CREDIT_CARD', 'PROMPTPAY']).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const updateData: any = {
        status: input.status,
        processedById: ctx.user.userId
      }

      if (input.paymentMethod) {
        updateData.paymentMethod = input.paymentMethod
      }

      return prisma.order.update({
        where: { id: input.id },
        data: updateData,
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          processedBy: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        }
      })
    }),

  getTodayStats: staffProcedure
    .query(async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const [todayOrders, todayRevenue, pendingOrders] = await Promise.all([
        prisma.order.count({
          where: {
            createdAt: {
              gte: today,
              lt: tomorrow
            }
          }
        }),
        prisma.order.aggregate({
          where: {
            createdAt: {
              gte: today,
              lt: tomorrow
            },
            status: {
              in: ['PAID', 'PREPARING', 'READY', 'COMPLETED']
            }
          },
          _sum: {
            totalAmount: true
          }
        }),
        prisma.order.count({
          where: {
            status: {
              in: ['PAID', 'PREPARING']
            }
          }
        })
      ])

      return {
        todayOrders,
        todayRevenue: Number(todayRevenue._sum.totalAmount || 0),
        pendingOrders
      }
    })
})