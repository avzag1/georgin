import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  // Расширяем интерфейс User, так как в Credentials-авторизации 
  // данные сначала прилетают из authorize() сюда
  interface User {
    id?: string | number; // Разрешаем ID быть и числом, и строкой
    role?: string;
  }

  // Расширяем структуру сессии, которую считывают файлы proxy.ts и компоненты
  interface Session {
    user: {
      id: number;
      role: string;
    } & import("next-auth").DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  // Расширяем JWT-токен, хранящийся в куки браузера
  interface JWT {
    id?: number;
    role?: string;
  }
}