import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // ✅ НАДЕЖНЫЙ СПОСОБ: Извлекаем параметры строки запроса прямо из request.url
    const { searchParams } = new URL(request.url);
    const showArchived = searchParams.get('archived') === 'true';

    // Запрашиваем данные из PostgreSQL через Prisma 7
    const products = await prisma.product.findMany({
      where: {
        isDeleted: showArchived, // Сюда гарантированно прилетит true или false
      },
      include: {
        orderProducts: true,
      },
      orderBy: {
        id: 'desc',
      }
    });

    return NextResponse.json(products || []);
  } catch (error: unknown) {
    console.error("Критическая ошибка в GET /api/products:", error);
    const msg = error instanceof Error ? error.message : "Неизвестная ошибка СУБД";
    return NextResponse.json({ error: `Не удалось загрузить: ${msg}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const imageFile = formData.get("image") as File | null;
    const priceStr = formData.get("price") as string;
    const categoryName = formData.get("categoryName") as string | null;
    if (!title || !priceStr || !categoryName) {
      return NextResponse.json(
        { error: "Поля Название, Цена и Категория обязательны" },
        { status: 400 },
      );
    }
    // const description = formData.get('description') as string;
    // const actionPriceStr = formData.get('actionPrice') as string;
    // const quantityInStoreStr = formData.get('quantityInStore') as string;

    let imageUrl = "/placeholder.png"; // Дефолтное изображение

    // Обработка и сохранение загруженного файла изображения
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Путь для сохранения: public/uploads/
      const uploadDir = join(process.cwd(), "public", "uploads");
      // Создаем директорию, если она еще не создана
      await mkdir(uploadDir, { recursive: true });

      // Формируем уникальное имя файла
      const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
      const filePath = join(uploadDir, fileName);

      // Записываем файл на диск сервера
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${fileName}`; // Этот путь сохраним в БД
    }

    const newProduct = await prisma.product.create({
      data: {
        title: title,
        description: (formData.get("description") as string) || "Без описания",
        image: imageUrl,
        price: parseFloat(priceStr),
        actionPrice: parseFloat(formData.get("actionPrice") as string) || 0,
        quantityInStore:
          parseInt(formData.get("quantityInStore") as string, 10) || 0,
        categoryName: categoryName,
      },

      include: {
        orderProducts: true,
      }

    });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: unknown) {
    console.error("Не удалось добавить новый товар:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json(
      { error: `Ошибка при создании товара: ${errorMessage}` },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = parseInt(searchParams.get('id') || '', 10);
  await prisma.product.update({
    where: { id: productId },
    data: { isDeleted: true }, // Скрываем товар, не удаляя его физически
  });
  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const idStr = formData.get("id") as string;
    if (!idStr) {
      return NextResponse.json(
        { error: "ID товара не указан" },
        { status: 400 },
      );
    }
    const productId = parseInt(idStr, 10);

    const title = formData.get("title") as string;
    const priceStr = formData.get("price") as string;
    const categoryName = formData.get("categoryName") as string;
    const imageFile = formData.get("image") as File | null;

    if (!title || !priceStr || !categoryName) {
      return NextResponse.json(
        { error: "Обязательные поля не заполнены" },
        { status: 400 },
      );
    }
    const updateData: Prisma.Args<typeof prisma.product, "update">["data"] = {
      title: title,
      description: (formData.get("description") as string) || "Без описания",
      price: parseFloat(priceStr),
      actionPrice: parseFloat(formData.get("actionPrice") as string) || 0,
      categoryName: categoryName,
      quantityInStore:
        parseInt(formData.get("quantityInStore") as string, 10) || 0,
    };

    // Обработка новой картинки и удаление старой с диска
    if (imageFile && imageFile.size > 0) {
      try {
        const currentProduct = await prisma.product.findUnique({
          where: { id: productId },
          select: { image: true },
        });

        if (
          currentProduct?.image &&
          currentProduct.image !== "/placeholder.png"
        ) {
          const oldFilePath = join(
            process.cwd(),
            "public",
            currentProduct.image,
          );
          await unlink(oldFilePath).catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : "неизвестно";
            console.warn(
              `Предупреждение: не удалось удалить старый файл: ${msg}`,
            );
          });
        }
      } catch (dbErr) {
        console.error("Ошибка при поиске старого изображения:", dbErr);
      }

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
      const filePath = join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      // Записываем новый путь в объект обновления
      updateData.image = `/uploads/${fileName}`;
    }

    // Выполняем обновление в PostgreSQL
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,

      include: {
        orderProducts: true,
      }
      
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error: unknown) {
    console.error("Ошибка при редактировании товара:", error);
    const msg = error instanceof Error ? error.message : "Ошибка сервера";
    return NextResponse.json(
      { error: `Не удалось обновить: ${msg}` },
      { status: 500 },
    );
  }
}
