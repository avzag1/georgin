import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";
const BUCKET_NAME = "022c62a9-5b17-4928-aca6-4d54213d95b6";
const S3_HOST = "https://s3.twcstorage.ru";
// Инициализация S3 клиента для Timeweb Cloud
const s3Client = new S3Client({
  endpoint: process.env.S3_URL,
  region: process.env.S3_REGION, // Для Timeweb S3 указывается ru-1 или us-east-1 (совместимый режим)
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Обязательно для многих S3-совместимых хранилищ
});

export async function GET(request: Request) {
  try {
    // Извлекаем параметры строки запроса прямо из request.url
    const { searchParams } = new URL(request.url);
    const showArchived = searchParams.get('archived') === 'true';

    // Запрашиваем данные из PostgreSQL через Prisma 7
    const products = await prisma.product.findMany({
      where: {
        isDeleted: showArchived,
      },
      include: {
        orderProducts: true,
      },
      orderBy: {
        id: 'desc',
      }
    });

    // Трансформируем массив товаров: если путь к картинке старый (локальный), 
    // подменяем его на внешнюю ссылку S3, чтобы Docker-контейнер не выдавал ошибку.
    const normalizedProducts = (products || []).map(product => {
      let imageUrl = product.image;
      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        // Превращаем "/uploads/file.png" в "https://twcstorage.ru"
        imageUrl = `${S3_HOST}/${BUCKET_NAME}${imageUrl}`;
      }

      return {
        ...product,
        image: imageUrl,
      };
    });

    return NextResponse.json(normalizedProducts);
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

    let imageUrl = "/placeholder.png"; // Дефолтное изображение

    // Обработка и сохранение загруженного файла изображения на Timeweb S3
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Формируем уникальное имя файла для бакета
      const fileName = `uploads/${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;

      // Параметры для загрузки в S3
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: imageFile.type || "image/jpeg",
        // Раскомментируйте строку ниже, если ваш бакет приватный по умолчанию и вы хотите сделать файлы публичными:
        ACL: "public-read" as const, 
      };

      // Отправляем файл в облако Timeweb
      await s3Client.send(new PutObjectCommand(uploadParams));

      // Формируем итоговый публичный URL картинки для сохранения в БД
      imageUrl = `${S3_HOST}/${BUCKET_NAME}/${fileName}`;
    }

    const newProduct = await prisma.product.create({
      data: {
        title: title,
        description: (formData.get("description") as string) || "Без описания",
        image: imageUrl,
        price: parseFloat(priceStr),
        actionPrice: parseFloat(formData.get("actionPrice") as string) || 0,
        quantityInStore: parseInt(formData.get("quantityInStore") as string, 10) || 0,
        categoryName: categoryName,
      },
      include: {
        orderProducts: true,
      }
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: unknown) {
    console.error("Не удалось добавить новый товар:", error);
    const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json(
      { error: `Ошибка при создании товара: ${errorMessage}` },
      { status: 500 },
    );
  }
} 

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    // Проверяем, передан ли ID
    if (!idParam) {
      return NextResponse.json(
        { error: "Параметр 'id' обязателен для удаления" },
        { status: 400 }
      );
    }
    const productId = parseInt(idParam, 10);
    // Проверяем, является ли ID валидным числом
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Некорректный формат ID товара" },
        { status: 400 }
      );
    }
    // Скрываем товар, меняя флаг в PostgreSQL через Prisma 7
    await prisma.product.update({
      where: { id: productId },
      data: { isDeleted: true }, // Мягкое удаление — файл на S3 сохраняется
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Критическая ошибка в DELETE /api/products:", error);
    // Если Prisma выдает ошибку P2025 (запись для обновления не найдена)
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json(
        { error: "Товар с указанным ID не найден в базе данных" },
        { status: 404 }
      );
    }
    const msg = error instanceof Error ? error.message : "Неизвестная ошибка СУБД";
    return NextResponse.json(
      { error: `Не удалось архивировать товар: ${msg}` },
      { status: 500 }
    );
  }
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

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Некорректный формат ID товара" },
        { status: 400 },
      );
    }

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
      quantityInStore: parseInt(formData.get("quantityInStore") as string, 10) || 0,
    };

    // Обработка новой картинки и удаление старой из Timeweb S3
    if (imageFile && imageFile.size > 0) {
      try {
        // Получаем текущий товар, чтобы узнать URL старого изображения
        const currentProduct = await prisma.product.findUnique({
          where: { id: productId },
          select: { image: true },
        });

        const oldImageUrl = currentProduct?.image;

        // Удаляем старый файл из S3, если это не дефолтная заглушка и ссылка ведет на наш S3
        if (
          oldImageUrl && 
          oldImageUrl !== "/placeholder.png" && 
          oldImageUrl.includes("s3.twcstorage.ru")
        ) {
          // Извлекаем S3-ключ объекта из полного URL (все, что идет после имени бакета)
          // Пример: из "https://twcstorage.ru/022c62a9.../uploads/123-file.png" достаем "uploads/123-file.png"
          const bucketMarker = `${process.env.S3_BUCKET_NAME}/`;
          const markerIndex = oldImageUrl.indexOf(bucketMarker);
          
          if (markerIndex !== -1) {
            const oldS3Key = oldImageUrl.substring(markerIndex + bucketMarker.length);
            
            // Удаляем объект из бакета Timeweb
            await s3Client.send(
              new DeleteObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: oldS3Key,
              })
            ).catch((err: unknown) => {
              const msg = err instanceof Error ? err.message : "неизвестно";
              console.warn(`Предупреждение: не удалось удалить старый файл ${oldS3Key} из S3: ${msg}`);
            });
          }
        }
      } catch (dbErr) {
        console.error("Ошибка при поиске или удалении старого изображения в S3:", dbErr);
      }

      // Загрузка нового файла изображения на S3
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `uploads/${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: imageFile.type || "image/jpeg",
        })
      );

      // Записываем новый абсолютный S3 URL в объект обновления для БД
      updateData.image = `${process.env.S3_URL}/${process.env.S3_BUCKET_NAME}/${fileName}`;
    }

    // Выполняем обновление в PostgreSQL через Prisma 7
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

    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json(
        { error: "Редактируемый товар не найден в базе данных" },
        { status: 404 }
      );
    }

    const msg = error instanceof Error ? error.message : "Ошибка сервера";
    return NextResponse.json(
      { error: `Не удалось обновить: ${msg}` },
      { status: 500 },
    );
  }
}
// export async function PUT(request: Request) {
//   try {
//     const formData = await request.formData();
//     const idStr = formData.get("id") as string;
//     if (!idStr) {
//       return NextResponse.json(
//         { error: "ID товара не указан" },
//         { status: 400 },
//       );
//     }
//     const productId = parseInt(idStr, 10);

//     const title = formData.get("title") as string;
//     const priceStr = formData.get("price") as string;
//     const categoryName = formData.get("categoryName") as string;
//     const imageFile = formData.get("image") as File | null;

//     if (!title || !priceStr || !categoryName) {
//       return NextResponse.json(
//         { error: "Обязательные поля не заполнены" },
//         { status: 400 },
//       );
//     }
//     const updateData: Prisma.Args<typeof prisma.product, "update">["data"] = {
//       title: title,
//       description: (formData.get("description") as string) || "Без описания",
//       price: parseFloat(priceStr),
//       actionPrice: parseFloat(formData.get("actionPrice") as string) || 0,
//       categoryName: categoryName,
//       quantityInStore:
//         parseInt(formData.get("quantityInStore") as string, 10) || 0,
//     };

//     // Обработка новой картинки и удаление старой с диска
//     if (imageFile && imageFile.size > 0) {
//       try {
//         const currentProduct = await prisma.product.findUnique({
//           where: { id: productId },
//           select: { image: true },
//         });

//         if (
//           currentProduct?.image &&
//           currentProduct.image !== "/placeholder.png"
//         ) {
//           const oldFilePath = join(
//             process.cwd(),
//             "public",
//             currentProduct.image,
//           );
//           await unlink(oldFilePath).catch((err: unknown) => {
//             const msg = err instanceof Error ? err.message : "неизвестно";
//             console.warn(
//               `Предупреждение: не удалось удалить старый файл: ${msg}`,
//             );
//           });
//         }
//       } catch (dbErr) {
//         console.error("Ошибка при поиске старого изображения:", dbErr);
//       }

//       const bytes = await imageFile.arrayBuffer();
//       const buffer = Buffer.from(bytes);

//       const uploadDir = join(process.cwd(), "public", "uploads");
//       await mkdir(uploadDir, { recursive: true });

//       const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
//       const filePath = join(uploadDir, fileName);

//       await writeFile(filePath, buffer);

//       // Записываем новый путь в объект обновления
//       updateData.image = `/uploads/${fileName}`;
//     }

//     // Выполняем обновление в PostgreSQL
//     const updatedProduct = await prisma.product.update({
//       where: { id: productId },
//       data: updateData,

//       include: {
//         orderProducts: true,
//       }
      
//     });

//     return NextResponse.json(updatedProduct, { status: 200 });
//   } catch (error: unknown) {
//     console.error("Ошибка при редактировании товара:", error);
//     const msg = error instanceof Error ? error.message : "Ошибка сервера";
//     return NextResponse.json(
//       { error: `Не удалось обновить: ${msg}` },
//       { status: 500 },
//     );
//   }
// }
