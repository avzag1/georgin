import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// 1. Получить все промокоды со всеми связями для админки
export async function GET() {
  try {
    const promocodes = await prisma.promocode.findMany({
      include: {
        products: {
          include: { product: { select: { title: true } } }
        },
        users: {
          include: { user: { select: { email: true } } }
        },
        _count: { select: { usages: true } } // Сколько раз промокод уже использовали
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(promocodes);
  } catch (error) {
    return NextResponse.json({ error: "Не удалось загрузить промокоды" }, { status: 500 });
  }
}

// 2. Создать промокод с возможностью точечной привязки к товарам или юзерам
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, discount, type, expiresAt, productIds, userIds } = body;
    if (!code || !discount) {
      return NextResponse.json({ error: "Код и скидка обязательны" }, { status: 400 });
    }
    // Создаем промокод внутри транзакции вместе со всеми связями
    const newPromo = await prisma.promocode.create({
      data: {
        code: code.toUpperCase().trim(),
        discount: parseFloat(discount),
        type: type || "PERCENT",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        // Если переданы ID продуктов, создаем записи в промежуточной таблице
        products: productIds && productIds.length > 0 ? {
          create: productIds.map((pId: number) => ({ productId: pId }))
        } : undefined,
        // Если переданы ID пользователей, делаем его персональным
        users: userIds && userIds.length > 0 ? {
          create: userIds.map((uId: number) => ({ userId: uId }))
        } : undefined,
      }
    });
    return NextResponse.json(newPromo, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Промокод с таким кодом уже существует" }, { status: 500 });
  }
}

// 3. Удаление промокода
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get("id");
    if (!idStr) return NextResponse.json({ error: "ID обязателен" }, { status: 400 });
    await prisma.promocode.delete({
      where: { id: parseInt(idStr, 10) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Не удалось удалить промокод" }, { status: 500 });
  }
}
