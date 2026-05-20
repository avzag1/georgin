import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // Проверяйте ваш путь к файлу lib/prisma.ts

export const dynamic = 'force-dynamic';

const CUSTOMER_ID = 1; // Целевой ID пользователя

export async function GET() {
  try {
    // 1. ГАРАНТИЯ НАЛИЧИЯ ПОЛЬЗОВАТЕЛЯ (Исправление ошибки P2003)
    // Ищем пользователя с id = 1, если его нет — создаем с дефолтными значениями по вашей схеме User
    let user = await prisma.user.findUnique({
      where: { id: CUSTOMER_ID },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: CUSTOMER_ID, // Принудительно задаем id = 1
          email: 'client_1@store.ru',
          name: 'Тестовый Клиент',
          role: 'customer',
        },
      });
    }

    // 2. Находим активный заказ ("new") для этого пользователя
    let order = await prisma.order.findFirst({
      where: { userId: CUSTOMER_ID, status: 'new' },
    });

    // Теперь создание заказа сработает на 100% успешно
    if (!order) {
      order = await prisma.order.create({
        data: { userId: CUSTOMER_ID, status: 'new' },
      });
    }

    // 3. Безопасный обход позиций для валидации остатков склада
    const itemsToCheck = await prisma.order_product.findMany({
      where: { orderId: order.id },
      include: { product: true },
    });

    for (const item of itemsToCheck) {
      if (item.quantityInOrder > item.product.quantityInStore) {
        await prisma.order_product.update({
          where: { id: item.id },
          data: { quantityInOrder: item.product.quantityInStore },
        });
      }
    }

    // 4. Возвращаем итоговый объект корзины со всеми связями
    const finalCart = await prisma.order.findFirst({
      where: { id: order.id },
      include: {
        orderProducts: {
          include: { product: true },
          orderBy: { id: 'asc' }, // Фиксируем сортировку элементов
        },
      },
    });

    return NextResponse.json(finalCart || { orderProducts: [] });
  } catch (error: unknown) {
    console.error('Критический сбой API Корзины:', error);
    const msg = error instanceof Error ? error.message : 'Ошибка PostgreSQL';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// 2. Обновление количества или удаление товара из корзины
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, orderProductId, quantity, action } = body;
    
    const CUSTOMER_ID = 1; // ID нашего тестового пользователя

    // Сценарий А: Удаление позиции из корзины (уже настроен ранее)
    if (action === 'delete' && orderProductId) {
      await prisma.order_product.delete({ where: { id: orderProductId } });
      return NextResponse.json({ success: true });
    }

    // Сценарий Б: Изменение количества кнопками "+" / "-" внутри корзины (уже настроен ранее)
    if (orderProductId && quantity) {
      const link = await prisma.order_product.findUnique({
        where: { id: orderProductId },
        include: { product: true },
      });

      if (!link) return NextResponse.json({ error: 'Позиция не найдена' }, { status: 404 });
      const finalQuantity = Math.max(1, Math.min(quantity, link.product.quantityInStore));

      const updated = await prisma.order_product.update({
        where: { id: orderProductId },
        data: { quantityInOrder: finalQuantity },
      });
      return NextResponse.json(updated);
    }

    // 🔥 НОВЫЙ СЦЕНАРИЙ В: Нажатие кнопки «Добавить в корзину» из каталога товаров
    if (productId) {
      // 1. Находим активный заказ ("new") пользователя
      let order = await prisma.order.findFirst({
        where: { userId: CUSTOMER_ID, status: 'new' },
      });

      if (!order) {
        order = await prisma.order.create({
          data: { userId: CUSTOMER_ID, status: 'new' },
        });
      }

      // 2. Проверяем остаток товара на складе
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product || product.quantityInStore <= 0) {
        return NextResponse.json({ error: 'Товара нет в наличии на складе' }, { status: 400 });
      }

      // 3. Проверяем, лежит ли уже этот товар в корзине
      const existingLink = await prisma.order_product.findFirst({
        where: { orderId: order.id, productId: productId },
      });

      if (existingLink) {
        // Если уже лежит — увеличиваем количество на 1 (но не выше остатка на складе)
        if (existingLink.quantityInOrder >= product.quantityInStore) {
          return NextResponse.json({ error: 'Достигнуто максимальное количество товара на складе' }, { status: 400 });
        }

        const updatedLink = await prisma.order_product.update({
          where: { id: existingLink.id },
          data: { quantityInOrder: existingLink.quantityInOrder + 1 },
        });
        return NextResponse.json(updatedLink);
      } else {
        // Если товара в корзине еще нет — создаем новую запись
        const newLink = await prisma.order_product.create({
          data: {
            orderId: order.id,
            productId: productId,
            quantityInOrder: 1,
          },
        });
        return NextResponse.json(newLink);
      }
    }

    return NextResponse.json({ error: 'Неверные параметры запроса' }, { status: 400 });
  } catch (error) {
    console.error('Ошибка POST /api/cart:', error);
    return NextResponse.json({ error: 'Ошибка сервера при изменении корзины' }, { status: 500 });
  }
}