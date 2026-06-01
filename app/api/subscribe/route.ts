import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Некорректный формат email" }, { status: 400 });
    }

    // 1. Проверяем, нет ли уже такого пользователя/подписчика в СУБД
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Чтобы не пугать пользователя ошибкой, пишем, что он уже подписан
      return NextResponse.json({ message: "Вы уже подписаны на рассылку!" }, { status: 200 });
    }

    // 2. Создаем нового пользователя-подписчика в базе mydb
    await prisma.user.create({
      data: {
        email,
        // Если в вашей схеме есть поле name или password, а они обязательные,
        // передайте туда заглушки, например name: "Подписчик"
      },
    });

    return NextResponse.json({ message: "Успешная подписка!" }, { status: 201 });
  } catch (error) {
    console.error("Ошибка при подписке:", error);
    return NextResponse.json({ error: "Ошибка сервера при оформлении подписки" }, { status: 500 });
  }
}
