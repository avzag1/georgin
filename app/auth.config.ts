import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Пусто для поддержки Edge-среды Middleware
  pages: {
    signIn: "/login", // Мы сделаем красивый кастомный роут для логина, чтобы избежать конфликтов с /api/auth
  },
} satisfies NextAuthConfig;