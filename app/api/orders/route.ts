import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Извлекаем параметры строки запроса из request.url
    const { searchParams } = new URL(request.url);
    const showArchived = searchParams.get("archived") === "true";

    const orders = await prisma.order.findMany({
      where: { status: showArchived ? "archived" : "completed" },
      include: {
        user: true,
        orderProducts: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders || []);
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось загрузить заказы" },
      { status: 500 },
    );
  }
}

// ✅ ДОБАВЛЕНО: Метод PATCH для переноса заказа в архив
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get("id");

    if (!idStr) {
      return NextResponse.json(
        { error: "ID заказа не указан" },
        { status: 400 },
      );
    }
    const orderId = parseInt(idStr, 10);

    // Обновляем статус заказа в PostgreSQL через Prisma 7
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "archived" }, // Меняем статус на архивный
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Ошибка сервера";
    return NextResponse.json(
      { error: `Не удалось изменить статус: ${msg}` },
      { status: 500 },
    );
  }
}
