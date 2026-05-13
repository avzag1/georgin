import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Строка подключения (всегда есть фолбэк к прямой строке, если Next.js потерял .env)
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/mydb?schema=public";

const prismaClientSingleton = () => {
  // 1. Создаем классический пул соединений через стандартный Node-драйвер pg
  const pool = new pg.Pool({ connectionString: databaseUrl })
  
  // 2. Оборачиваем пул в официальный адаптер Prisma v7
  const adapter = new PrismaPg(pool)

  // 3. Передаем адаптер в конструктор. Теперь требования Client Engine полностью выполнены!
  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma



// import { PrismaClient } from '@prisma/client'

// const prismaClientSingleton = () => {
//   return new PrismaClient()
// }

// declare global {
//   var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
// }

// const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

// export default prisma

// if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

