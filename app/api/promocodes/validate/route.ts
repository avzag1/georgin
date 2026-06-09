import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/auth"; // Мы просто берём auth из вашего файла

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Промокод не указан" }, { status: 400 });
    }

    // 1. Ищем промокод в базе данных
    const promocode = await prisma.promocode.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: { users: true, products: true },
    });

    if (!promocode || !promocode.isActive) {
      return NextResponse.json({ error: "Промокод не найден или отключен" }, { status: 404 });
    }

    if (promocode.expiresAt && promocode.expiresAt < new Date()) {
      return NextResponse.json({ error: "Срок действия промокода истек" }, { status: 400 });
    }

    // 2. Узнаем, какой пользователь сейчас залогинен
    const session = await auth(); 
    const userId = session?.user?.id ? Number(session.user.id) : null;

    // 3. Проверяем, доступен ли промокод этому пользователю
    if (promocode.users.length > 0) {
      if (!userId) {
        return NextResponse.json({ error: "Этот промокод только для зарегистрированных пользователей" }, { status: 401 });
      }
      const isAssigned = promocode.users.some((u) => u.userId === userId);
      if (!isAssigned) {
        return NextResponse.json({ error: "Этот промокод вам не доступен" }, { status: 403 });
      }
    }

    // 4. Проверяем, не использовал ли он его уже
    if (userId) {
      const alreadyUsed = await prisma.promocodeUsage.findFirst({
        where: { promocodeId: promocode.id, userId: userId },
      });
      if (alreadyUsed) {
        return NextResponse.json({ error: "Вы уже использовали этот промокод" }, { status: 400 });
      }
    }

    // Если всё супер, возвращаем данные на фронтенд
    return NextResponse.json({
      valid: true,
      code: promocode.code,
      discount: promocode.discount,
      discountType: promocode.type,
      applicableProductIds: promocode.products.map((p) => p.productId), 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
