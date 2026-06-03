import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Пусто для поддержки Edge-среды Middleware
  pages: {
    signIn: "/login", // Мы сделаем красивый кастомный роут для логина, чтобы избежать конфликтов с /api/auth
  },
  secret: process.env.AUTH_SECRET || "$2b$10$604n1qE2vWUJ0no1pzsbXORq7SYWVQQw4DJHr8Zls8fU5nrsed9SC"
} satisfies NextAuthConfig;