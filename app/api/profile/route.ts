// import { NextResponse } from 'next/server';
// import { prisma } from '@/app/lib/prisma';
// import { auth } from '@/app/auth';

// export async function PUT(request: Request) {
//   try {
//     const session = await auth();
    
//     // Если пользователь анонимен, запрещаем PUT-запросы к СУБД
//     if (!session || !session.user) {
//       return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
//     }

//     const userId = (session.user as unknown as { id: number }).id;
//     const { name, email, phone } = await request.json();

//     if (!name || !email || !phone) {
//       return NextResponse.json({ error: 'Все поля обязательны для заполнения' }, { status: 400 });
//     }

//     // Обновляем запись в PostgreSQL через Prisma 7
//     const updatedUser = await prisma.user.update({
//       where: { id: userId },
//       data: {
//         name,
//         email,
//         // Сохраняем телефон в стандартную колонку, если она добавлена в схему
//         phone: phone 
//       },
//     });

//     return NextResponse.json({ success: true, user: updatedUser });
//   } catch (error: unknown) {
//     console.error('Ошибка PUT /api/profile:', error);
//     return NextResponse.json({ error: 'Не удалось обновить профиль в базе данных' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/app/auth';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Имя, e-mail и номер телефона обязательны!' }, 
        { status: 400 }
      );
    }

    const session = await auth();
    let userId: number | null = null;

    if (session?.user) {
      userId = (session.user as unknown as { id: number }).id;
    }

    let user;

    if (userId) {
      // Авторизованный пользователь (например, админ) — обновляем данные
      user = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
        },
      });
    } else {
      // Гость сайта — ищем в СУБД по уникальной почте
      const existingUser = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      if (existingUser) {
        // Если гость уже покупал ранее — обновляем имя и телефон
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: name.trim(),
            phone: phone.trim(),
          },
        });
      } else {
        // Абсолютно новый гость — регистрируем в PostgreSQL
        user = await prisma.user.create({
          data: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            role: 'customer',
          },
        });
      }
    }

    // Возвращаем userId на фронтенд для фиксации в localStorage
    return NextResponse.json({ 
      success: true, 
      userId: user.id 
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Ошибка СУБД:', error);
    return NextResponse.json(
      { error: 'Не удалось сохранить данные в базу данных' }, 
      { status: 500 }
    );
  }
}
