"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Вызываем авторизацию NextAuth по паролю
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Отключаем авто-редирект NextAuth, сделаем его вручную ниже
      });

      if (result?.error) {
        setError("Неверный email или пароль");
      } else {
        // Успешный вход — отправляем администратора в админку!
        router.push("/adminPanel");
        router.refresh();
      }
    } catch (err) {
      setError("Произошла ошибка при входе");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border p-8 max-w-sm w-full space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-gray-900">Вход в панель админа</h2>
          <p className="text-xs text-gray-500">Доступ только для сотрудников склада</p>
        </div>

        {error && (
          <div className="p-3 text-xs font-semibold text-center text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@store.ru"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Пароль</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7E8F52] hover:bg-[#6b7a44] text-white font-medium py-2 rounded-lg transition-colors text-sm disabled:bg-gray-300"
          >
            {loading ? "Проверка данных..." : "Войти в систему"}
          </button>
        </form>
      </div>
    </div>
  );
}