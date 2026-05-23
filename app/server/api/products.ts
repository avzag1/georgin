import type { Product } from "@prisma/client"
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
// import { Prisma } from '../../generated/prisma/client';
import { Prisma } from "@prisma/client";
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';

interface ProductWithOrders {
  id: number;
  image: string;
  title: string;
  description: string;
  price: number;
  actionPrice: number;
  category: string;
  quantityInStore: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Описываем структуру вложенного массива, приходящего из API
  orderProducts: {
    id: number;
    productId: number;
    orderId: number;
    quantityInOrder: number;
    createdAt: string | Date;
    updatedAt: string | Date;
  }[];
}

export interface NewProduct {
  title: string
  description: string
  image: string
  price: number
  actionPrice: number
  category: string
  quantityInStore: number
}

export async function fetchProducts(): Promise<ProductWithOrders[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
  if (!res.ok) {
    throw new Error("404")
  }
  return await res.json()
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`)
  if (!res.ok) {
    throw new Error("404")
  }
  return await res.json()
}

export async function fetchSearchProducts(query: string = "") {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/search?query=${query}`)
  if (!res.ok) {
    throw new Error("404")
  }
  return await res.json()
}

export async function addNewProduct(newProduct: NewProduct) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProduct),
  })
  if (!response.ok) {
    throw new Error("Не удалось добавить товар")
  }
  const newProductResponse: NewProduct = await response.json()
  return newProductResponse
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const idStr = formData.get('id') as string;
    
    if (!idStr) {
      return NextResponse.json({ error: 'ID товара не указан' }, { status: 400 });
    }
    const productId = parseInt(idStr, 10);

    const title = formData.get('title') as string;
    const priceStr = formData.get('price') as string;
    const categoryName = formData.get('categoryName') as string;
    const imageFile = formData.get('image') as File | null;

    if (!title || !priceStr || !categoryName) {
      return NextResponse.json({ error: 'Обязательные поля не заполнены' }, { status: 400 });
    }

    // Извлекаем тип инпута из аргументов метода update для Prisma 7
    const updateData: Prisma.Args<typeof prisma.product, 'update'>['data'] = {
      title: title,
      description: (formData.get('description') as string) || 'Без описания',
      price: parseFloat(priceStr),
      actionPrice: parseFloat(formData.get('actionPrice') as string) || 0,
      categoryName: categoryName,
      quantityInStore: parseInt(formData.get('quantityInStore') as string, 10) || 0,
    };

    // ОБРАБОТКА И УДАЛЕНИЕ СТАРОЙ КАРТИНКИ (если загружена новая)
    if (imageFile && imageFile.size > 0) {
      try {
        // 1. Находим текущий товар в базе данных, чтобы узнать путь к его старой картинке
        const currentProduct = await prisma.product.findUnique({
          where: { id: productId },
          select: { image: true },
        });

        // 2. Если старая картинка существует и это не дефолтный плейсхолдер — удаляем её
        if (currentProduct?.image && currentProduct.image !== '/placeholder.png') {
          // Превращаем URL вида '/uploads/file.jpg' в абсолютный путь на диске
          const oldFilePath = join(process.cwd(), 'public', currentProduct.image);
          
          // Удаляем файл (вызов обернут в try-catch на случай, если файла физически уже нет на диске)
          await unlink(oldFilePath).catch((err) => 
            console.warn(`Предупреждение: Не удалось удалить старый файл ${oldFilePath}:`, err.message)
          );
        }
      } catch (dbErr) {
        console.error('Ошибка при поиске старого изображения:', dbErr);
      }

      // 3. Сохраняем новую картинку на диск стандартным способом
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
      const filePath = join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      
      // Записываем новый путь в объект обновления
      updateData.image = `/uploads/${fileName}`;
    }

    // 4. Выполняем обновление записи в PostgreSQL через Prisma 7
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error: unknown) {
    console.error('Ошибка при редактировании товара:', error);
    const msg = error instanceof Error ? error.message : 'Ошибка сервера';
    return NextResponse.json({ error: `Не удалось обновить: ${msg}` }, { status: 500 });
  }
}
