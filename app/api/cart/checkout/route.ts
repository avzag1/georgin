import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/auth";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Добавили promocode в деструктуризацию
    const { guestName, guestPhone, guestAddress, comment, promocode: promoCodeText } = body;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Вы должны быть авторизованы" }, { status: 401 });
    }
    
    // Сделали let вместо const, чтобы переменную можно было безопасно использовать ниже
    const userId = Number(session.user.id);

    const finalName = session.user.name || guestName || "Покупатель";
    const finalPhone = guestPhone;
    const finalAddress = guestAddress;

    // Жесткая серверная валидация обязательных полей
    if (
      !finalPhone ||
      !finalAddress ||
      finalPhone.trim() === "" ||
      finalAddress.trim() === ""
    ) {
      return NextResponse.json(
        {
          error: "Оформление невозможно: телефон и адрес доставки обязательны для заполнения!",
        },
        { status: 400 },
      );
    }

    // Ищем корзину пользователя со статусом "new"
    const activeOrder = await prisma.order.findFirst({
      where: { userId, status: "new" },
    });

    if (!activeOrder) {
      return NextResponse.json(
        { error: "Ваша корзина пуста" },
        { status: 400 },
      );
    }

    // 1. Получаем все товары в корзине
    const cartItems = await prisma.order_product.findMany({
      where: { orderId: activeOrder.id },
      include: { product: true },
    });

    // Расчет базовой стоимости до применения промокода
    const baseAmount = cartItems.reduce((sum, item) => {
      const actualPrice = item.product.actionPrice > 0 ? item.product.actionPrice : item.product.price;
      return sum + (item.quantityInOrder * actualPrice);
    }, 0);

    let discountAmount = 0;
    let promocodeIdToRegister: number | null = null;

    // 2. Строгая серверная проверка промокода (если он был передан с фронтенда)
    if (typeof promoCodeText === "string" && promoCodeText.trim()) {
      const promocode = await prisma.promocode.findUnique({
        where: { code: promoCodeText.trim().toUpperCase() },
        include: { users: true, products: true }
      });

      if (!promocode || !promocode.isActive || (promocode.expiresAt && promocode.expiresAt < new Date())) {
        return NextResponse.json({ error: "Промокод невалиден или истек" }, { status: 400 });
      }

      // Проверяем, за кем закреплен промокод (если он персональный)
      if (promocode.users.length > 0 && !promocode.users.some(u => u.userId === userId)) {
        return NextResponse.json({ error: "Этот промокод вам недоступен" }, { status: 403 });
      }

      // Проверяем, не использовался ли код ранее
      const alreadyUsed = await prisma.promocodeUsage.findFirst({
        where: { promocodeId: promocode.id, userId: userId }
      });
      if (alreadyUsed) {
        return NextResponse.json({ error: "Вы уже использовали этот промокод" }, { status: 400 });
      }

      promocodeIdToRegister = promocode.id;

      // Рассчитываем скидку с учетом ограничений по товарам
      const hasProductRestrictions = promocode.products.length > 0;
      const allowedProductIds = promocode.products.map(p => p.productId);

      if (hasProductRestrictions) {
        let restrictedBaseAmount = 0;
        cartItems.forEach(item => {
          if (allowedProductIds.includes(item.productId)) {
            const actualPrice = item.product.actionPrice > 0 ? item.product.actionPrice : item.product.price;
            restrictedBaseAmount += item.quantityInOrder * actualPrice;
          }
        });

        if (promocode.type === "PERCENT") {
          discountAmount = (restrictedBaseAmount * promocode.discount) / 100;
        } else {
          discountAmount = Math.min(promocode.discount, restrictedBaseAmount); 
        }
      } else {
        if (promocode.type === "PERCENT") {
          discountAmount = (baseAmount * promocode.discount) / 100;
        } else {
          discountAmount = Math.min(promocode.discount, baseAmount);
        }
      }
    }

    // 3. Выполняем запись в базу через транзакцию (чтобы все операции прошли успешно вместе)
    const finalOrder = await prisma.$transaction(async (tx) => {
      // Замораживаем цены для товаров
      for (const item of cartItems) {
        const finalPrice = item.product.actionPrice > 0 ? item.product.actionPrice : item.product.price;
        await tx.order_product.update({
          where: { id: item.id },
          data: { priceAtPurchase: Math.round(finalPrice) }, 
        });
      }

      const finalComment = comment || "Без комментария";

      // Обновляем заказ: переводим статус, записываем адрес и данные скидки
      const order = await tx.order.update({
        where: { id: activeOrder.id },
        data: {
          status: "completed",
          comment: finalComment,
          address: finalAddress, 
          appliedPromo: typeof promoCodeText === "string" && promoCodeText.trim() ? promoCodeText.trim().toUpperCase() : null,
          discountAmount: discountAmount, // Запись скидки в рублях для бухгалтерии/истории заказа
          createdAt: new Date(),
        },
      });

      // Записываем промокод в историю использований
      if (promocodeIdToRegister) {
        await tx.promocodeUsage.create({
          data: {
            promocodeId: promocodeIdToRegister,
            userId: userId,
            orderId: order.id
          }
        });
      }

      return order;
    });

    return NextResponse.json({ success: true, orderId: finalOrder.id });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Внутренняя ошибка при оформлении" },
      { status: 500 },
    );
  }
}
