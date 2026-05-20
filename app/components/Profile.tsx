"use client";

import Image from "next/image";
import { useState } from "react";
import { TextInput, Label, Button, Checkbox } from "flowbite-react";
import { useStore } from '../store/useStore';
import { useSession, signOut } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CategoryItem {
  id: number;
  category: string;
}

const updateProfileRequest = async (body: { name: string; email: string; phone: string }) => {
  const res = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Не удалось обновить профиль');
  return data;
};

export default function Profile() {
  const queryClient = useQueryClient();
  const profileModal = useStore((state) => state.profileModal);
  const setProfileModal = useStore((state) => state.setProfileModal);

  // Подключаем сессию Auth.js v5
  const { data: session, status, update: updateSession } = useSession();
  const isAuthenticated = status === "authenticated";

  const [agreed, setAgreed] = useState(false);

  // Извлекаем дефолтные значения из СУБД PostgreSQL
  const dbName = session?.user?.name || "";
  const dbEmail = session?.user?.email || "";
  const dbPhone = (session?.user as unknown as { phone?: string })?.phone || "";

  // 1. ИСПРАВЛЕНИЕ ДЛЯ ЛИНТЕРА: Стейты инициализируются строго через ленивые функции.
  // Хук useEffect полностью УДАЛЁН из тела компонента. Ошибка cascading renders физически невозможна!
  const [name, setName] = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("guest_name") || "";
    return "";
  });

  const [email, setEmail] = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("guest_email") || "";
    return "";
  });

  const [phone, setPhone] = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("guest_phone") || "";
    return "";
  });

  // Настройка мутации сохранения профиля в PostgreSQL
  const profileMutation = useMutation({
    mutationFn: updateProfileRequest,
    onSuccess: async () => {
      await updateSession();
      alert("Данные вашего профиля успешно сохранены в базе данных!");
      setProfileModal(0);
    },
    onError: (err: Error) => {
      alert(`Ошибка сервера: ${err.message}`);
    },
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreed) {
      alert("Необходимо дать согласие на обработку персональных данных");
      return;
    }

    // Определяем финальные значения (если пользователь авторизован и не менял инпут, берем данные из БД)
    const finalName = isAuthenticated ? (name || dbName) : name;
    const finalEmail = isAuthenticated ? (email || dbEmail) : email;
    const finalPhone = isAuthenticated ? (phone || dbPhone) : phone;

    if (isAuthenticated) {
      profileMutation.mutate({ name: finalName, email: finalEmail, phone: finalPhone });
    } else {
      localStorage.setItem("guest_name", name);
      localStorage.setItem("guest_email", email);
      localStorage.setItem("guest_phone", phone);
      alert("Данные гостя успешно зафиксированы на этом устройстве!");
      setProfileModal(0);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Вы уверены, что хотите выйти? Все данные будут стёрты.")) {
      localStorage.removeItem("guest_name");
      localStorage.removeItem("guest_email");
      localStorage.removeItem("guest_phone");
      localStorage.removeItem("guest_address");
      
      setName("");
      setEmail("");
      setPhone("");
      setAgreed(false);

      if (isAuthenticated) {
        await signOut({ redirect: false });
      }

      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setProfileModal(0);
    }
  };

  const getProfileClass = () => 
    `${profileModal === 1 ? 
      "flex w-[600px] h-[640px] p-10 bg-white border fixed inset-y-[calc(50%-320px)] inset-x-[calc(50%-300px)] z-50 rounded-2xl shadow-xl flex-col justify-between" 
      : "hidden"}`;

  // Вычисляем текущее имя для отображения под аватаром
  const displayTitleName = isAuthenticated ? (name || dbName) : "Войти";

  return (
    <div className={getProfileClass()}>
      <div className="space-y-4 relative w-full flex flex-col h-full">
        
        {/* Кнопка закрытия модалки */}
        <button 
          type="button" 
          onClick={() => setProfileModal(0)} 
          className="absolute right-0 top-0 p-1 hover:opacity-70 transition-opacity"
        >
          <Image src="/closeIcon.png" alt="Крест" width={15} height={17} />
        </button>
        
        {/* Аватар и динамическая подпись ("Имя" или "Войти") */}
        <div className="flex flex-col items-center border-b pb-3 w-full select-none">
          <div className="p-1 rounded-full border border-gray-100 bg-gray-50/50 shadow-2xs">
            <Image src="/profile.png" alt="Профиль" width={44} height={44} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mt-2 tracking-tight">
            {displayTitleName}
          </h3>
          <span className="text-xs text-gray-400 mt-0.5 font-light">
            {isAuthenticated ? "Авторизованный доступ" : "Покупка без регистрации (Гость)"}
          </span>
        </div>

        {/* ✅ КЛЮЧЕВОЕ РЕШЕНИЕ: Динамический аттрибут key={status}. 
            Когда пользователь залогинится, NextAuth сменит статус с "loading" на "authenticated".
            React увидит изменение ключа, мгновенно пересоздаст форму и подставит актуальный defaultValue 
            прямо из PostgreSQL, при этом инпуты останутся полностью доступными для редактирования и стирания букв! */}
        <form 
          key={status} 
          onSubmit={handleFormSubmit} 
          className="space-y-4 flex-1 flex flex-col justify-between pt-2"
        >
          <div className="space-y-3">
            
            {/* Поле ИМЯ */}
            <div>
              <div className="mb-1 block">
                <Label htmlFor="profile-name">Ваше имя*</Label>
              </div>
              <TextInput
                id="profile-name"
                className="[&_input]:p-2 [&_input]:rounded-none"
                type="text"
                placeholder="Введите ваше имя"
                // Если авторизован — подставляем дефолт из СУБД, если гость — из стейта гостя
                defaultValue={isAuthenticated ? dbName : name}
                disabled={profileMutation.isPending}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                required
              />
            </div>
            
            {/* Поле EMAIL */}
            <div>
              <div className="mb-1 block">
                <Label htmlFor="profile-email">e-mail*</Label>
              </div>
              <TextInput
                id="profile-email"
                className="[&_input]:p-2 [&_input]:rounded-none"
                type="email"
                placeholder="ivanov@mail.ru"
                defaultValue={isAuthenticated ? dbEmail : email}
                disabled={profileMutation.isPending}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Поле ТЕЛЕФОН */}
            <div>
              <div className="mb-1 block">
                <Label htmlFor="profile-phone">Номер телефона*</Label>
              </div>
              <TextInput
                id="profile-phone"
                className="[&_input]:p-2 [&_input]:rounded-none"
                type="tel"
                placeholder="+7 (999) 000-00-00"
                defaultValue={isAuthenticated ? dbPhone : phone}
                disabled={profileMutation.isPending}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                required
              />
            </div>
            
            {/* Соглашение */}
            <div className="flex items-start gap-2 pt-1.5">
              <Checkbox 
                id="profile-remember" 
                checked={agreed}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreed(e.target.checked)}
                className="mt-0.5 scale-110"
              />
              <Label htmlFor="profile-remember" className="text-[11px] leading-tight text-gray-500 font-normal cursor-pointer select-none">
                Я принимаю пользовательское соглашение и даю согласие на обработку 
                ИП Таммет Яан Эдуардович моих персональных данных на условиях, 
                определенных политикой конфиденциальности
              </Label>
            </div>
          </div>

          {/* Панель управления кнопками */}
          <div className="space-y-2 pt-2 border-t">
            <Button 
              type="submit" 
              disabled={profileMutation.isPending}
              className="w-full h-[45] bg-[#7E8F52] hover:bg-[#6b7a44] transition-colors text-center flex items-center justify-center font-medium disabled:bg-gray-300"
            >
              {profileMutation.isPending ? "Сохранение изменений..." : "Сохранить данные"}
            </Button>

            {(isAuthenticated || name || phone || dbName) && (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors"
              >
                Выйти из профиля (очистить кэш)
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
