import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma as unknown as Parameters<typeof PrismaAdapter>[0]),
  providers: [
    Credentials({
      name: "Вход для Администратора",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user) return null;

        const passwordHash = (user as unknown as { passwordHash?: string }).passwordHash;
        if (!passwordHash) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          passwordHash
        );

        if (isPasswordValid) {
          // Возвращаем объект. Эти данные NextAuth передает в первый аргумент колбэка jwt(user)
          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role // ◄ Наша роль "admin" из PostgreSQL
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        const customUser = session.user as unknown as { id: number; role: string; phone: string };
        
        customUser.id = parseInt(token.sub, 10);
        customUser.role = (token.role as string) || "customer";
        
        // ✅ ДОБАВЛЕНО: Пробрасываем телефон из JWT-токена в объект сессии на фронтенде
        customUser.phone = (token.phone as string) || "";
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        const typedUser = user as unknown as { id: number; role?: string; phone?: string };
        const typedToken = token as unknown as { role: string; phone: string };
        
        if (typedUser.id) token.sub = String(typedUser.id);
        typedToken.role = typedUser.role || "customer";
        
        // ✅ ДОБАВЛЕНО: Сохраняем номер телефона из PostgreSQL в зашифрованный JWT токен куки
        typedToken.phone = typedUser.phone || "";
      }
      return token;
    }
  },
  
  session: {
    strategy: "jwt", // Обязательно для Credentials-сессий
  }
});