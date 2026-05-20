import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/app/auth';

export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    // Если пользователь анонимен, запрещаем PUT-запросы к СУБД
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
    }

    const userId = (session.user as unknown as { id: number }).id;
    const { name, email, phone } = await request.json();

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Все поля обязательны для заполнения' }, { status: 400 });
    }

    // Обновляем запись в PostgreSQL через Prisma 7
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        // Сохраняем телефон в стандартную колонку, если она добавлена в схему
        phone: phone 
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: unknown) {
    console.error('Ошибка PUT /api/profile:', error);
    return NextResponse.json({ error: 'Не удалось обновить профиль в базе данных' }, { status: 500 });
  }
}