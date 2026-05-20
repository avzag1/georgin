import { NextResponse } from 'next/server';
import { prisma } from "../../../lib/prisma";

export const dynamic = 'force-dynamic';

// 1. Получение только мягко удаленных товаров
export async function GET() {
  try {
    const archivedProducts = await prisma.product.findMany({
      where: {
        isDeleted: true, // Фильтр: только удаленные
      },
      include: {
        orderProducts: true,
      },
    });
    return NextResponse.json(archivedProducts || []);
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Не удалось загрузить архив' }, { status: 500 });
  }
}

// 2. Восстановление товара из архива
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');

    if (!idStr) {
      return NextResponse.json({ error: 'ID товара не указан' }, { status: 400 });
    }
    const productId = parseInt(idStr, 10);

    // Меняем флаг обратно на false
    const restoredProduct = await prisma.product.update({
      where: { id: productId },
      data: { isDeleted: false },
    });

    return NextResponse.json(restoredProduct, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Ошибка сервера';
    return NextResponse.json({ error: `Не удалось восстановить: ${msg}` }, { status: 500 });
  }
}