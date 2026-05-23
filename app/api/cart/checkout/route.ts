import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestName, guestPhone, guestAddress, comment } = body;

    const session = await auth();
    let userId = 9999;

    // ✅ ИСПРАВЛЕНИЕ: Заменили let на const, так как эти переменные не переназначаются
    const finalName = session?.user
      ? session.user.name || guestName
      : guestName;
    const finalPhone = guestPhone;
    const finalAddress = guestAddress;

    if (session?.user) {
      userId = (session.user as unknown as { id: number }).id;
    }

    // Жесткая серверная валидация обязательных полей
    if (
      !finalPhone ||
      !finalAddress ||
      finalPhone.trim() === "" ||
      finalAddress.trim() === ""
    ) {
      return NextResponse.json(
        {
          error:
            "Оформление невозможно: телефон и адрес доставки обязательны для заполнения!",
        },
        { status: 400 },
      );
    }

    const activeOrder = await prisma.order.findFirst({
      where: { userId, status: "new" },
    });

    if (!activeOrder) {
      return NextResponse.json(
        { error: "Ваша корзина пуста" },
        { status: 400 },
      );
    }

    // 1. Считываем все товары, которые сейчас лежат в этой корзине, вместе с их текущими ценами из каталога
    const cartItems = await prisma.order_product.findMany({
      where: { orderId: activeOrder.id },
      include: { product: true },
    });

    // 2. Проходимся по каждой позиции и "замораживаем" цену в самой строке корзины
    for (const item of cartItems) {
      // Определяем, была ли на момент оформления у букета акционная цена
      const finalPrice =
        item.product.actionPrice > 0
          ? item.product.actionPrice
          : item.product.price;

      await prisma.order_product.update({
        where: { id: item.id },
        data: { priceAtPurchase: finalPrice }, // ✅ Фиксируем цену продажи в СУБД навсегда
      });
    }

    // Сохраняем контакты гостя в комментарий (для истории), если он не залогинен
    const finalComment = session?.user
      ? comment || "Без комментария"
      : `[Гость: ${finalName || "Не указано"}]. ${comment || "Комментарий отсутствует"}`;

    // Если пользователь гость, обновляем его профиль-заглушку актуальным телефоном
    if (!session?.user) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          email: `${finalPhone}@guest.store`,
          name: finalName || "Гость",
        },
      });
    }

    // Обновляем заказ, записывая обязательный адрес и комментарий
    await prisma.order.update({
      where: { id: activeOrder.id },
      data: {
        status: "completed",
        comment: finalComment,
        address: finalAddress, // ✅ Записываем обязательный адрес в PostgreSQL
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, orderId: activeOrder.id });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Внутренняя ошибка при оформлении" },
      { status: 500 },
    );
  }
}
