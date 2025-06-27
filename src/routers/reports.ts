import { z } from 'zod'
import { publicProcedure, router } from '../lib/trpc'
import { prisma } from '../lib/prisma'
import { TRPCError } from '@trpc/server'
import * as csvWriter from 'csv-writer'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Export report data types
export interface DailyReport {
  date: string
  orders: number
  revenue: number
  averageOrderValue: number
}

export interface MenuItemReport {
  id: number
  name: string
  category: string
  totalQuantity: number
  totalRevenue: number
  orderCount: number
}

export interface ReportData {
  period: string
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  topItems: Array<{
    name: string
    quantity: number
    revenue: number
  }>
}

export const reportsRouter = router({
  // Get daily reports for the last N days
  getDailyReports: publicProcedure
    .input(z.object({
      days: z.number().optional().default(7)
    }))
    .query(async ({ input }) => {
      try {
        const { days } = input
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        startDate.setHours(0, 0, 0, 0)

        // Get orders grouped by date
        const orders = await prisma.order.findMany({
          where: {
            createdAt: {
              gte: startDate
            },
            status: {
              in: ['PAID', 'PREPARING', 'READY', 'COMPLETED']
            }
          },
          select: {
            createdAt: true,
            totalAmount: true
          }
        })

        // Group by date
        const dailyData = new Map<string, { orders: number; revenue: number }>()
        
        orders.forEach(order => {
          const dateKey = order.createdAt.toISOString().split('T')[0]
          const existing = dailyData.get(dateKey) || { orders: 0, revenue: 0 }
          
          dailyData.set(dateKey, {
            orders: existing.orders + 1,
            revenue: existing.revenue + Number(order.totalAmount)
          })
        })

        // Convert to array format
        const dailyReports: DailyReport[] = []
        for (let i = 0; i < days; i++) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateKey = date.toISOString().split('T')[0]
          
          const data = dailyData.get(dateKey) || { orders: 0, revenue: 0 }
          dailyReports.unshift({
            date: dateKey,
            orders: data.orders,
            revenue: data.revenue,
            averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0
          })
        }

        return dailyReports
      } catch (error) {
        console.error('Get daily reports error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get daily reports'
        })
      }
    }),

  // Get menu item performance reports
  getMenuItemReports: publicProcedure
    .input(z.object({
      period: z.string().optional().default('7d')
    }))
    .query(async ({ input }) => {
      try {
        const { period } = input
        let days = 7
        
        switch (period) {
          case '30d': days = 30; break
          case '90d': days = 90; break
          default: days = 7
        }

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        startDate.setHours(0, 0, 0, 0)

        // Get order items with menu item data
        const orderItems = await prisma.orderItem.findMany({
          where: {
            order: {
              createdAt: {
                gte: startDate
              },
              status: {
                in: ['PAID', 'PREPARING', 'READY', 'COMPLETED']
              }
            }
          },
          include: {
            menuItem: true,
            order: true
          }
        })

        // Group by menu item
        const itemStats = new Map<number, {
          id: number
          name: string
          category: string
          totalQuantity: number
          totalRevenue: number
          orderCount: number
        }>()

        orderItems.forEach(item => {
          const existing = itemStats.get(item.menuItemId) || {
            id: item.menuItem.id,
            name: item.menuItem.name,
            category: item.menuItem.category,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0
          }

          itemStats.set(item.menuItemId, {
            ...existing,
            totalQuantity: existing.totalQuantity + item.quantity,
            totalRevenue: existing.totalRevenue + Number(item.totalPrice),
            orderCount: existing.orderCount + 1
          })
        })

        const menuItemReports: MenuItemReport[] = Array.from(itemStats.values())
          .sort((a, b) => b.totalRevenue - a.totalRevenue)

        return menuItemReports
      } catch (error) {
        console.error('Get menu item reports error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get menu item reports'
        })
      }
    }),

  // Get period report summary
  getPeriodReport: publicProcedure
    .input(z.object({
      period: z.string().optional().default('7d')
    }))
    .query(async ({ input }) => {
      try {
        const { period } = input
        let days = 7
        
        switch (period) {
          case '30d': days = 30; break
          case '90d': days = 90; break
          default: days = 7
        }

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        startDate.setHours(0, 0, 0, 0)

        // Get orders for the period
        const orders = await prisma.order.findMany({
          where: {
            createdAt: {
              gte: startDate
            },
            status: {
              in: ['PAID', 'PREPARING', 'READY', 'COMPLETED']
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

        // Calculate totals
        const totalOrders = orders.length
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

        // Get top items
        const itemStats = new Map<string, { quantity: number; revenue: number }>()
        
        orders.forEach(order => {
          order.items.forEach(item => {
            const existing = itemStats.get(item.menuItem.name) || { quantity: 0, revenue: 0 }
            itemStats.set(item.menuItem.name, {
              quantity: existing.quantity + item.quantity,
              revenue: existing.revenue + Number(item.totalPrice)
            })
          })
        })

        const topItems = Array.from(itemStats.entries())
          .map(([name, stats]) => ({
            name,
            quantity: stats.quantity,
            revenue: stats.revenue
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10)

        const reportData: ReportData = {
          period,
          totalOrders,
          totalRevenue,
          averageOrderValue,
          topItems
        }

        return reportData
      } catch (error) {
        console.error('Get period report error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get period report'
        })
      }
    }),

  // Export report in CSV or PDF format
  exportReport: publicProcedure
    .input(z.object({
      period: z.string(),
      format: z.enum(['csv', 'pdf'])
    }))
    .mutation(async ({ input }) => {
      try {
        const { period, format } = input
        
        // Get the report data
        let days = 7
        switch (period) {
          case '30d': days = 30; break
          case '90d': days = 90; break
          default: days = 7
        }

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        startDate.setHours(0, 0, 0, 0)

        const orders = await prisma.order.findMany({
          where: {
            createdAt: { gte: startDate },
            status: { in: ['PAID', 'PREPARING', 'READY', 'COMPLETED'] }
          },
          include: {
            items: { include: { menuItem: true } }
          }
        })

        if (format === 'csv') {
          // Generate CSV
          const csvData = orders.map(order => ({
            orderNumber: order.queueNumber,
            customerName: order.customerName,
            date: order.createdAt.toISOString().split('T')[0],
            time: order.createdAt.toTimeString().split(' ')[0],
            status: order.status,
            totalAmount: Number(order.totalAmount),
            paymentMethod: order.paymentMethod || '',
            items: order.items.map(item => 
              `${item.menuItem.name} x${item.quantity}`
            ).join(', ')
          }))

          const tempDir = os.tmpdir()
          const filename = `tokyojung-report-${period}-${Date.now()}.csv`
          const filepath = path.join(tempDir, filename)

          const writer = csvWriter.createObjectCsvWriter({
            path: filepath,
            header: [
              { id: 'orderNumber', title: 'Order Number' },
              { id: 'customerName', title: 'Customer Name' },
              { id: 'date', title: 'Date' },
              { id: 'time', title: 'Time' },
              { id: 'status', title: 'Status' },
              { id: 'totalAmount', title: 'Total Amount' },
              { id: 'paymentMethod', title: 'Payment Method' },
              { id: 'items', title: 'Items' }
            ]
          })

          await writer.writeRecords(csvData)
          const csvContent = fs.readFileSync(filepath, 'utf8')
          fs.unlinkSync(filepath) // Clean up temp file

          return csvContent
        } 
        
        if (format === 'pdf') {
          // Generate PDF
          const tempDir = os.tmpdir()
          const filename = `tokyojung-report-${period}-${Date.now()}.pdf`
          const filepath = path.join(tempDir, filename)

          const doc = new PDFDocument()
          const stream = fs.createWriteStream(filepath)
          doc.pipe(stream)

          // PDF Header
          doc.fontSize(20).text('Tokyojung Sales Report', 50, 50)
          doc.fontSize(12).text(`Period: ${period}`, 50, 80)
          doc.text(`Generated: ${new Date().toLocaleString()}`, 50, 95)

          // Summary
          const totalOrders = orders.length
          const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
          const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0

          doc.text(`Total Orders: ${totalOrders}`, 50, 120)
          doc.text(`Total Revenue: ฿${totalRevenue.toFixed(2)}`, 50, 135)
          doc.text(`Average Order Value: ฿${avgOrder.toFixed(2)}`, 50, 150)

          // Orders table
          doc.text('Order Details:', 50, 180)
          let yPosition = 200

          orders.slice(0, 20).forEach(order => { // Limit to first 20 orders
            if (yPosition > 750) {
              doc.addPage()
              yPosition = 50
            }

            doc.text(`#${order.queueNumber} - ${order.customerName}`, 50, yPosition)
            doc.text(`฿${Number(order.totalAmount)}`, 400, yPosition)
            doc.text(order.createdAt.toISOString().split('T')[0], 500, yPosition)
            yPosition += 20
          })

          doc.end()

          // Wait for PDF to be written
          await new Promise<void>((resolve) => {
            stream.on('finish', () => resolve())
          })

          const pdfBuffer = fs.readFileSync(filepath)
          fs.unlinkSync(filepath) // Clean up temp file

          return pdfBuffer.toString('base64')
        }

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid format specified'
        })
      } catch (error) {
        console.error('Export report error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export report'
        })
      }
    })
})