import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/app/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    let userId: number | null = null;

    if (session?.user) {
      // Сценарий 1: Вошел авторизованный пользователь по Магической ссылке
      userId = (session.user as unknown as { id: number }).id;
    } else {
      // Сценарий 2: ГОСТЬ. В реальном проекте гостя идентифицируют по временным куки (session cookies).
      // В качестве надежной альтернативы, привяжем корзину к системному User с id = 9999 (Аноним)
      userId = 9999;
      
      // Гарантируем, что гостевой профиль-заглушка существует в базе
      const guestUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!guestUser) {
        await prisma.user.create({
          data: {
            id: userId,
            email: 'guest@store.ru',
            name: 'Гость сайта',
            role: 'customer'
          }
        });
      }
    }

    // Находим или создаем заказ со статусом "new" для этого ID
    let order = await prisma.order.findFirst({
      where: { userId: userId, status: 'new' },
    });

    if (!order) {
      order = await prisma.order.create({
        data: { userId: userId, status: 'new' },
      });
    }

    const finalCart = await prisma.order.findFirst({
      where: { id: order.id },
      include: {
        orderProducts: {
          include: { product: true },
          orderBy: { id: 'asc' },
        },
      },
    });

    return NextResponse.json(finalCart || { orderProducts: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, orderProductId, quantity, action } = body;
    
    const session = await auth();
    let userId = 9999; // ID нашего системного гостя-анонима

    if (session?.user) {
      userId = (session.user as unknown as { id: number }).id;
    } else {
      // ✅ ИСПРАВЛЕНИЕ: Гарантируем, что гостевой профиль с id=9999 существует в СУБД
      // перед тем, как создавать для него связи в таблице заказов!
      const guestUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!guestUser) {
        await prisma.user.create({
          data: {
            id: userId,
            email: 'guest@store.ru',
            name: 'Гость сайта',
            role: 'customer'
          }
        });
      }
    }

    // Сценарий А: Удаление позиции из корзины
    if (action === 'delete' && orderProductId) {
      await prisma.order_product.delete({ where: { id: orderProductId } });
      return NextResponse.json({ success: true });
    }

    // Сценарий Б: Изменение количества кнопками "+" / "-" внутри корзины
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

    // Сценарий В: Нажатие кнопки «Заказать» из каталога товаров
    if (productId) {
      // Находим или создаем активный заказ ("new") пользователя/гостя
      let order = await prisma.order.findFirst({
        where: { userId: userId, status: 'new' },
      });

      if (!order) {
        order = await prisma.order.create({
          data: { userId: userId, status: 'new' },
        });
      }

      // Проверяем остаток товара на складе
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        return NextResponse.json({ error: 'Товар не найден в базе данных' }, { status: 404 });
      }
      if (product.quantityInStore <= 0) {
        return NextResponse.json({ error: 'Этого букета больше нет в наличии на складе' }, { status: 400 });
      }

      // Проверяем, лежит ли уже этот товар в корзине
      const existingLink = await prisma.order_product.findFirst({
        where: { orderId: order.id, productId: productId },
      });

      if (existingLink) {
        if (existingLink.quantityInOrder >= product.quantityInStore) {
          return NextResponse.json({ error: 'Достигнуто максимальное количество товара на складе' }, { status: 400 });
        }

        const updatedLink = await prisma.order_product.update({
          where: { id: existingLink.id },
          data: { quantityInOrder: existingLink.quantityInOrder + 1 },
        });
        return NextResponse.json(updatedLink);
      } else {
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
    console.error('Критическая ошибка POST /api/cart:', error);
    return NextResponse.json({ error: 'Ошибка сервера при изменении корзины' }, { status: 500 });
  }
}