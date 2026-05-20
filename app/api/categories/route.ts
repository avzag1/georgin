import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma'; 

export async function GET() {
  try {
    // Получаем все категории из БД
    const categories = await prisma.category.findMany({
      orderBy: { category: 'asc' }, // Сортировка по алфавиту
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось добавить категории' }, { status: 500 });
  }
}

// НОВЫЙ метод POST для создания категории
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Название категории не может быть пустым' }, { status: 400 });
    }

    // Проверяем, существует ли уже такая категория
    const existing = await prisma.category.findFirst({
      where: { category: name.trim() },
    });

    if (existing) {
      return NextResponse.json({ error: 'Такая категория уже существует' }, { status: 400 });
    }

    // Создаем запись в базе через Prisma 7
    const newCategory = await prisma.category.create({
      data: {
        category: name.trim(),
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: `Ошибка сервера: ${msg}` }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');

    if (!idStr) {
      return NextResponse.json({ error: 'ID категории не указан' }, { status: 400 });
    }
    const categoryId = parseInt(idStr, 10);

    // Удаляем категорию из PostgreSQL через Prisma 7
    // Благодаря onDelete: Cascade, все связанные товары удалятся автоматически на уровне БД
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('Ошибка при удалении категории:', error);
    const msg = error instanceof Error ? error.message : 'Ошибка сервера';
    return NextResponse.json({ error: `Не удалось удалить категорию: ${msg}` }, { status: 500 });
  }
}