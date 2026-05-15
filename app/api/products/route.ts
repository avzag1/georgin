import { prisma } from '../../lib/prisma';
import { NextResponse } from "next/server"
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic'

// export async function GET() {
//   const products = await prisma.product.findMany({
//     include: { 
//       orderProducts: true,
//       category: true 
//     },
//   })
//   return NextResponse.json(products)
// }
export async function GET() {
  try {
    // 1. Делаем максимально простой запрос без инклюдов для проверки связи с PostgreSQL
    const products = await prisma.product.findMany();
    
    // 2. Явно возвращаем массив
    return NextResponse.json(products || []);
  } catch (error: unknown) {
    // Этот лог вы ОБЯЗАТЕЛЬНО увидите в терминале VS Code (где запущен npm run dev)
    console.error('--- КРИТИЧЕСКАЯ ОШИБКА PRISMA НА СЕРВЕРЕ ---');
    console.error(error);
    
    // Передаем текст ошибки в свойство 'error', чтобы клиентский компонент смог его прочитать
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка СУБД';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const imageFile = formData.get('image') as File | null;
    const priceStr = formData.get('price') as string;
    const categoryName = formData.get('categoryName') as string | null;
     if (!title || !priceStr || !categoryName) {
      return NextResponse.json({ error: 'Поля Название, Цена и Категория обязательны' }, { status: 400 });
    }
    // const description = formData.get('description') as string;
    // const actionPriceStr = formData.get('actionPrice') as string;
    // const quantityInStoreStr = formData.get('quantityInStore') as string;

    let imageUrl = '/placeholder.png'; // Дефолтное изображение

    // Обработка и сохранение загруженного файла изображения
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Путь для сохранения: public/uploads/
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      // Создаем директорию, если она еще не создана
      await mkdir(uploadDir, { recursive: true });

      // Формируем уникальное имя файла
      const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
      const filePath = join(uploadDir, fileName);

      // Записываем файл на диск сервера
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${fileName}`; // Этот путь сохраним в БД
    }

    const newProduct = await prisma.product.create({
      data: {
        title: title,
        description: formData.get('description') as string || 'Без описания',
        image: imageUrl,
        price: parseFloat(priceStr),
        actionPrice: parseFloat(formData.get('actionPrice') as string) || 0,
        quantityInStore: parseInt(formData.get('quantityInStore') as string, 10) || 0,
        categoryName: categoryName
        // category: {
        //   connect: {
        //     id: parseInt(categoryIdStr, 10)
        //   }
        // }
      },
    })

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error: unknown) {
    console.error('Не удалось добавить новый товар:', error);
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json(
      { error: `Ошибка при создании товара: ${errorMessage}` }, 
      { status: 500 }
    );
  }
}
