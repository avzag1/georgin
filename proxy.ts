import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./app/auth.config";
// Импортируем инстанс Prisma напрямую в прокси
import { prisma } from "@/app/lib/prisma"; 

const { auth } = NextAuth(authConfig);

export default auth(async function proxy(req) {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!session?.user;

  // Игнорируем любые служебные API-запросы NextAuth
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Защита и проверка для страницы входа
  if (pathname === "/login") {
    if (isLoggedIn && session?.user?.email) {
      // Проверяем роль напрямую в PostgreSQL
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      });
      if (dbUser?.role === "admin") {
        return NextResponse.redirect(new URL("/adminPanel", nextUrl));
      }
    }
    return NextResponse.next();
  }

  // 🔥 ЗАЩИТА АДМИН-ПАНЕЛИ (С ПРЯМОЙ ПРОВЕРКОЙ ИЗ PostgreSQL)
  if (pathname.startsWith("/adminPanel")) {
    // 1. Если не вошел в аккаунт — отправляем на форму ввода пароля
    if (!isLoggedIn || !session?.user?.email) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    console.log("--- ДИНАМИЧЕСКАЯ ПРОВЕРКА ИЗ PostgreSQL ---");
    console.log("Пользователь:", session.user.email);

    // 2. Делаем прямой запрос в базу данных минуя куки и JWT токены
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    const userRole = dbUser?.role;
    console.log("Реальная роль из таблицы users СУБД:", userRole);
    console.log("-------------------------------------------");

    // 3. Проверяем роль администратора
    if (userRole !== "admin") {
      console.log("❌ Доступ заблокирован: роль в БД не равна 'admin'.");
      return NextResponse.redirect(new URL("/", nextUrl));
    }

    console.log("✅ Роль подтверждена! Добро пожаловать на склад.");
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/adminPanel/:path*", "/login"],
};