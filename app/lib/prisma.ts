import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  // Настраиваем пул соединений стандартного драйвера pg
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // Создаем адаптер Prisma 7
  const adapter = new PrismaPg(pool);

  // Передаем адаптер в клиент
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;