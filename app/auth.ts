import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import Nodemailer from "next-auth/providers/nodemailer"; 
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma as unknown as Parameters<typeof PrismaAdapter>[0]),
  providers: [
    // 2. Добавляем и настраиваем транспорт Mail.ru
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || "465", 10),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        secure: true, 
      },
      from: process.env.EMAIL_FROM,

      // ✅ РЕШЕНИЕ: Переопределяем стандартный текст на красивый русский HTML-шаблон
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const { createTransport } = await import("nodemailer");
        const transport = createTransport(provider.server);
        
        // Чистый текст для почтовых клиентов, не поддерживающих HTML
        const textTemplate = `Вход на сайт Магазина Букетов\n\nДля подтверждения входа перейдите по ссылке:\n${url}\n\nЕсли вы не запрашивали это письмо, просто проигнорируйте его.`;
        
        // Красивая HTML-верстка письма с зеленой кнопкой в стиле вашего сайта
        const htmlTemplate = `
          <div style="background-color: #f9f9f9; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8e8e8; padding: 30px; border-radius: 12px; shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h2 style="color: #333333; margin-bottom: 10px; font-weight: 600;">Магазин цветов Георгин</h2>
              <p style="color: #666666; font-size: 15px; line-height: 1.5; margin-bottom: 25px;">
                Здравствуйте! Вы запросили вход в личный кабинет. Нажмите на кнопку ниже, чтобы подтвердить авторизацию:
              </p>
              <div style="margin: 30px 0;">
                <a href="${url}" target="_blank" style="background-color: #7E8F52; color: #ffffff; padding: 14px 30px; font-size: 15px; font-weight: 500; text-decoration: none; border-radius: 8px; display: inline-block; transition: background-color 0.2s;">
                  Войти в личный кабинет
                </a>
              </div>
              <p style="color: #999999; font-size: 12px; line-height: 1.5; margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;">
                Ссылка действительна в течение 24 часов.<br>
                Если вы не запрашивали это письмо, вы можете безопасно его проигнорировать.
              </p>
            </div>
          </div>
        `;

        // Отправляем письмо через SMTP Mail.ru
        await transport.sendMail({
          to: email,
          from: provider.from,
          subject: `Георгин ссылка для входа в личный кабинет`,
          text: textTemplate,
          html: htmlTemplate,
        });
      },
    }),
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
    // 1. Фильтр отправки писем (оставляем без изменений)
    async signIn({ user, account }) {
      if (account?.provider === "nodemailer" && user?.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email.trim().toLowerCase() },
        });
        if (!existingUser) return false; 
      }
      return true;
    },

    // 2. ✅ ИСПРАВЛЕНИЕ ДЛЯ JWT: Этот колбэк срабатывает и при входе админа, и при входе по ссылке.
    // Если пользователь зашел по магической ссылке (user из базы данных), 
    // мы принудительно записываем его ID, роль и телефон в JWT-токен.
    async jwt({ token, user }) {
      if (user) {
        // ✅ ИСПРАВЛЕНИЕ: Приведение к интерфейсу с кастомными свойствами из PostgreSQL
        const dbUser = user as { 
          id?: string | number; 
          role?: string; 
          phone?: string; 
          name?: string | null; 
          email?: string | null; 
        };

        if (dbUser.id) {
          token.sub = String(dbUser.id);
        }
        token.role = dbUser.role || "customer";
        token.phone = dbUser.phone || "";
        token.name = dbUser.name || "";
        token.email = dbUser.email || "";
      }
      return token;
    },

    // 3. ✅ ИСПРАВЛЕНИЕ ДЛЯ СЕССИИ: Пробрасываем данные из JWT-токена на фронтенд.
    // Теперь при клике по ссылке из письма фронтенд мгновенно получит 
    // статус "authenticated" и все данные пользователя!
    async session({ session, token }) {
      if (session.user && token.sub) {
        // ✅ ИСПРАВЛЕНИЕ: Описываем кастомные свойства для объекта session.user
        const customUser = session.user as { 
          id?: number; 
          role?: string; 
          phone?: string;
          name?: string | null;
          email?: string | null;
        };
        
        customUser.id = parseInt(token.sub, 10);
        customUser.role = (token.role as string) || "customer";
        customUser.phone = (token.phone as string) || "";
        
        session.user.name = (token.name as string) || "";
        session.user.email = (token.email as string) || "";
      }
      return session;
    },
  },
  
  session: {
    strategy: "jwt", // Обязательно для Credentials-сессий
  }
});