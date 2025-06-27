import { PrismaClient, UserRole, MenuCategory, PaymentMethod } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Tokyojung database...')

  // Create default users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@tokyojung.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      password: hashedPassword,
    },
  })

  const cashier = await prisma.user.create({
    data: {
      email: 'cashier@tokyojung.com',
      name: 'Cashier User',
      role: UserRole.CASHIER,
      password: hashedPassword,
    },
  })

  const kitchen = await prisma.user.create({
    data: {
      email: 'kitchen@tokyojung.com',
      name: 'Kitchen Staff',
      role: UserRole.KITCHEN,
      password: hashedPassword,
    },
  })

  console.log('✅ Users created')

  // Create menu items - Kanom (stuffed pancakes)
  const kanomItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: 'ขนมครกกล้วย',
        nameEn: 'Banana Kanom Krok',
        description: 'ขนมครกใส่กล้วย หวานหอม เนื้อนุ่ม',
        price: 25.00,
        category: MenuCategory.KANOM,
        available: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'ขนมครกข้าวโพด',
        nameEn: 'Corn Kanom Krok',
        description: 'ขนมครกใส่ข้าวโพด หวานกำลังดี',
        price: 25.00,
        category: MenuCategory.KANOM,
        available: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'ขนมครกมะพร้าว',
        nameEn: 'Coconut Kanom Krok',
        description: 'ขนมครกมะพร้าวแท้ หอมกะทิ',
        price: 30.00,
        category: MenuCategory.KANOM,
        available: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'ขนมครกฟักทอง',
        nameEn: 'Pumpkin Kanom Krok',
        description: 'ขนมครกฟักทอง สีสวย รสชาติเข้มข้น',
        price: 30.00,
        category: MenuCategory.KANOM,
        available: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'ขนมครกใบเตย',
        nameEn: 'Pandan Kanom Krok',
        description: 'ขนมครกใบเตย หอมใบเตยธรรมชาติ',
        price: 30.00,
        category: MenuCategory.KANOM,
        available: true,
      },
    }),
  ])

  // Create drinks
  const drinkItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: 'ชาเย็น',
        nameEn: 'Thai Iced Tea',
        description: 'ชาเย็นแท้ รสชาติเข้มข้น',
        price: 20.00,
        category: MenuCategory.DRINK,
        available: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'กาแฟเย็น',
        nameEn: 'Iced Coffee',
        description: 'กาแฟเย็นเข้มข้น หอมกรุ่น',
        price: 25.00,
        category: MenuCategory.DRINK,
        available: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'น้ำใบเตย',
        nameEn: 'Pandan Drink',
        description: 'น้ำใบเตยเย็น หอมใบเตย',
        price: 15.00,
        category: MenuCategory.DRINK,
        available: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'น้ำมะพร้าว',
        nameEn: 'Coconut Water',
        description: 'น้ำมะพร้าวสด เย็นชื่นใจ',
        price: 20.00,
        category: MenuCategory.DRINK,
        available: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'น้ำเปล่า',
        nameEn: 'Water',
        description: 'น้ำดื่มสะอาด',
        price: 10.00,
        category: MenuCategory.DRINK,
        available: true,
      },
    }),
  ])

  console.log('✅ Menu items created')

  // Create sample order
  const sampleOrder = await prisma.order.create({
    data: {
      queueNumber: 1,
      customerName: 'ลูกค้าตัวอย่าง',
      status: 'PAID',
      totalAmount: 70.00,
      paymentMethod: PaymentMethod.CASH,
      processedById: cashier.id,
      items: {
        create: [
          {
            menuItemId: kanomItems[0].id,
            quantity: 2,
            unitPrice: 25.00,
            totalPrice: 50.00,
          },
          {
            menuItemId: drinkItems[0].id,
            quantity: 1,
            unitPrice: 20.00,
            totalPrice: 20.00,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  })

  console.log('✅ Sample order created')

  console.log('🎉 Seeding completed!')
  console.log('\n📊 Summary:')
  console.log('- Users: 3 (admin, cashier, kitchen)')
  console.log('- Menu items: 10 (5 kanom + 5 drinks)')
  console.log('- Sample order: 1')
  console.log('\n👤 Login credentials:')
  console.log('- admin@tokyojung.com / password123')
  console.log('- cashier@tokyojung.com / password123')
  console.log('- kitchen@tokyojung.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })