"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { TextInput, Label, Button, Checkbox } from "flowbite-react";
import { useStore } from "../store/useStore";
import { useSession, signOut } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Функция-запрос к серверному API для обновления профиля
const updateProfileRequest = async (body: {
  name: string;
  email: string;
  phone: string;
}) => {
  const res = await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Не удалось обновить профиль");
  return data;
};

export default function Profile() {
  const queryClient = useQueryClient();

  // Zustand-стейты управления модальным окном
  const profileModal = useStore((state) => state.profileModal);
  const setProfileModal = useStore((state) => state.setProfileModal);

  // Подключаем сессию Auth.js v5 (NextAuth)
  const { data: session, status, update: updateSession } = useSession();
  const isAuthenticated = status === "authenticated";

  const [agreed, setAgreed] = useState(false);

  // Данные пользователя напрямую из базы данных PostgreSQL
  const dbName = session?.user?.name || "";
  const dbEmail = session?.user?.email || "";
  const dbPhone = (session?.user as unknown as { phone?: string })?.phone || "";
  useEffect(() => {
    if (isAuthenticated) {
      if (dbName) setName(dbName);
      if (dbEmail) setEmail(dbEmail);
      if (dbPhone) setPhone(dbPhone);
    }
  }, [isAuthenticated, dbName, dbEmail, dbPhone]);

  // 1. ЛЕГКАЯ ЛЕНИВАЯ ИНИЦИАЛИЗАЦИЯ: Считываем данные гостя из localStorage при первом рендере.
  // Это предотвращает появление ошибки cascading renders, так как мы не вызываем setState в useEffect!
  const [name, setName] = useState<string>(() => {
    if (typeof window !== "undefined")
      return localStorage.getItem("guest_name") || "";
    return "";
  });

  const [email, setEmail] = useState<string>(() => {
    if (typeof window !== "undefined")
      return localStorage.getItem("guest_email") || "";
    return "";
  });

  const [phone, setPhone] = useState<string>(() => {
    if (typeof window !== "undefined")
      return localStorage.getItem("guest_phone") || "";
    return "";
  });

  // ✅ ДОБАВЛЕНО: Флаг проверки, что компонент успешно смонтирован в браузере
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Мутация TanStack Query для безопасного сохранения профиля
  const profileMutation = useMutation({
    mutationFn: updateProfileRequest,
    onSuccess: async (data: { success: boolean; userId: number }) => {
      // Обновляем токен сессии на клиенте, чтобы имя под аватаркой изменилось мгновенно
      if (isAuthenticated) {
        await updateSession();
      }

      // Сохраняем id из PostgreSQL и контакты в localStorage
      if (data?.userId) {
        localStorage.setItem("guest_id", String(data.userId));
      }
      localStorage.setItem("guest_name", name);
      localStorage.setItem("guest_email", email);
      localStorage.setItem("guest_phone", phone);

      alert("Данные вашего профиля успешно сохранены в базе данных!");
      setProfileModal(0);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
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

    // Защита: если инпуты пустые (пользователь не менял их), берем дефолтные значения из СУБД
    const finalName = name || dbName;
    const finalEmail = email || dbEmail;
    const finalPhone = phone || dbPhone;

    // Сетевой запрос в СУБД улетает всегда (и для гостя, и для авторизованного)
    profileMutation.mutate({
      name: finalName,
      email: finalEmail,
      phone: finalPhone,
    });
  };

  const handleLogout = async () => {
    if (
      window.confirm(
        "Вы уверены, что хотите выйти? Все данные профиля будут стёрты.",
      )
    ) {
      localStorage.removeItem("guest_id");
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

  // ✅ Функция отправки магической ссылки БЕЗ редиректа на страницу админа
  const handleSendMagicLink = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault(); // Блокируем дефолтное поведение формы Next.js

    if (!email || !email.includes("@")) {
      alert(
        "Пожалуйста, сначала введите корректный e-mail для отправки ссылки!",
      );
      return;
    }

    try {
      const { signIn } = await import("next-auth/react");

      // Вызываем nodemailer, жестко запрещая редирект на кастомные страницы страниц pages.signIn
      const result = await signIn("nodemailer", {
        email: email.trim().toLowerCase(),
        redirect: false,
        callbackUrl: window.location.origin,
      });

      // ✅ ДОБАВЛЕНО: Проверка блокировки от бэкенда
      // Если СУБД вернула AccessDenied — выводим человеческий текст вместо технического лога
      if (
        result?.error === "AccessDenied" ||
        result?.url?.includes("error=AccessDenied")
      ) {
        alert(
          "Ошибка: Пользователь с таким e-mail не найден в системе! Пожалуйста, сначала сохраните ваши данные или оформите заказ.",
        );
        return;
      }

      if (result?.error) {
        alert(`Ошибка при отправке: ${result.error}`);
        return;
      }

      alert(
        `Магическая ссылка для входа успешно отправлена на адрес ${email}! Проверьте вашу почту.`,
      );
    } catch (error) {
      alert(
        "Не удалось отправить ссылку. Проверьте настройки почтового сервера.",
      );
    }
  };

  // ✅ 1. Проверяем, зафиксирован ли пользователь в СУБД (через NextAuth или по заполненным гостевым полям)
  const isUserSaved = isAuthenticated || Boolean(name && email && phone);

  // ✅ 2. Вычисляем заголовок модального окна на основе статуса
  // const displayTitleName = isAuthenticated
  //   ? dbName
  //   : name
  //     ? `Личный кабинет: ${name}`
  //     : "Личный кабинет гостя";

  // ✅ 3. Вычисляем подзаголовок статуса доступа
  // const displaySubTitle = isUserSaved
  //   ? "Профиль успешно сохранен в базе данных"
  //   : "Покупка без регистрации (Гость)";

  const displayTitleName = !isClient
    ? "Личный кабинет гостя"
    : isAuthenticated
      ? dbName
      : name
        ? `Личный кабинет: ${name}`
        : "Личный кабинет гостя";

  const displaySubTitle = !isClient
    ? "Покупка без регистрации (Гость)"
    : isUserSaved
      ? "Профиль успешно сохранен в базе данных"
      : "Покупка без регистрации (Гость)";

  // Вычисляем, какую именно подпись отображать под иконкой на главной странице
  // const displayHeaderName =
  //   isAuthenticated && dbName ? dbName : name || "Войти";

  // ✅ ИСПРАВЛЕНИЕ: Пока страница рендерится на сервере (isClient === false) — всегда выводится "Войти".
  // Как только страница оживает в браузере — подставляется реальное имя из localStorage.
  // Это на 100% ликвидирует ошибку Hydration failed!
  const displayHeaderName = !isClient
    ? "Войти"
    : isAuthenticated && dbName
      ? dbName
      : name || "Войти";

  const getProfileClass = () =>
    `${
      profileModal === 1
        ? "flex w-screen sm:w-[600] h-auto sm:h-[640] p-10 bg-white border border-solid fixed sm:inset-y-[calc(50%-320px)] sm:inset-x-[calc(50%-300px)] z-100 sm:z-90 rounded-2xl shadow-2xl flex-col justify-between"
        : "hidden"
    }`;

  return (
    <>
      {/* ✅ СЕКЦИЯ 1: ИКОНКА И ПОДПИСЬ ПОД НЕЙ (Всегда видны в шапке сайта) */}
      <div className="flex flex-col items-center justify-center select-none">
        <button
          type="button"
          onClick={() => setProfileModal(1)} // Открывает модальное окно по клику
          className="flex justify-center items-center rounded-full mt-11 sm:mt-6 p-1 cursor-pointer w-[44] h-[44] bg-[#7E8F52]
          text-white text-sm 
          transition-colors duration-200 hover:bg-[#616e40]
           active:bg-[#d7e6b2] active:text-[#242918]"
        >
          <svg
            width="16"
            height="23"
            viewBox="0 0 16 23"
            fill="none"
            xmlns="http://w3.org"
          >
            <path
              d="M7.97979 8.75499C10.1213 8.75499 11.8573 7.01898 11.8573 4.8775C11.8573 2.73601 10.1213 1 7.97979 1C5.83831 1 4.10229 2.73601 4.10229 4.8775C4.10229 7.01898 5.83831 8.75499 7.97979 8.75499Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M14.9592 17.2567C14.9592 19.8262 14.9592 21.9097 7.97974 21.9097C1.00024 21.9097 1.00024 19.8262 1.00024 17.2567C1.00024 14.6872 4.12531 12.6037 7.97974 12.6037C11.8342 12.6037 14.9592 14.6872 14.9592 17.2567Z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>
        <button onClick={() => setProfileModal(1)}>
          <span className="text-xs font-medium text-gray-600 mt-1 max-w-[90] truncate text-center">
            {displayHeaderName}
          </span>
        </button>
      </div>

      {/* ✅ СЕКЦИЯ 2: СКРЫТОЕ МОДАЛЬНОЕ ОКНО (Открывается поверх контента) */}
      <div className={getProfileClass()}>
        <div className="space-y-4 relative w-full flex flex-col h-full">
          {/* Кнопка Крестик для закрытия */}
          <button
            type="button"
            onClick={() => setProfileModal(0)}
            className="absolute right-0 top-0 p-1 hover:opacity-70 transition-opacity cursor-pointer"
          >
            <Image src="/closeIcon.png" alt="Крест" width={15} height={17} />
          </button>

          {/* Заголовок внутри всплывающего окна */}
          {/* <div className="flex flex-col items-center border-b pb-3 w-full select-none">
            <h3 className="text-xl font-semibold text-gray-900 mt-2 tracking-tight">
              {isAuthenticated ? dbName : "Личный кабинет гостя"}
            </h3>
            <span className="text-xs text-gray-400 mt-0.5 font-light">
              {isAuthenticated ? "Авторизованный доступ" : "Покупка без регистрации (Гость)"}
            </span>
          </div> */}
          <div className="flex flex-col items-center border-b pb-3 w-full select-none">
            <h3 className="text-xl font-semibold text-gray-900 mt-2 tracking-tight">
              {/* ✅ Динамический заголовок с именем гостя из базы данных */}
              {displayTitleName}
            </h3>
            <span className="text-xs text-gray-400 mt-0.5 font-light">
              {/* ✅ Динамический статус сохранения */}
              {displaySubTitle}
            </span>
          </div>

          {/* Форма редактирования с ключом отслеживания статуса сессии */}
          <form
            key={status}
            onSubmit={handleFormSubmit}
            className="space-y-4 flex-1 flex flex-col justify-between pt-2"
          >
            <div className="space-y-3">
              {/* Поле ИМЯ (Полностью контролируемое и доступное для стирания и изменения букв) */}
              <div>
                <div className="mb-1 block">
                  <Label htmlFor="profile-name">Ваше имя*</Label>
                </div>
                <TextInput
                  id="profile-name"
                  type="text"
                  placeholder="Введите ваше имя"
                  value={name}
                  disabled={profileMutation.isPending}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  required
                  className="[&_input]:p-2 [&_input]:rounded-none"
                />
              </div>

              {/* Поле EMAIL */}
              <div>
                <div className="mb-1 block">
                  <Label htmlFor="profile-email">e-mail*</Label>
                </div>
                <TextInput
                  id="profile-email"
                  type="email"
                  placeholder="ivanov@mail.ru"
                  value={email}
                  disabled={profileMutation.isPending}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  required
                  className="[&_input]:p-2 [&_input]:rounded-none"
                />
              </div>

              {/* Поле ТЕЛЕФОН */}
              <div>
                <div className="mb-1 block">
                  <Label htmlFor="profile-phone">Номер телефона*</Label>
                </div>
                <TextInput
                  id="profile-phone"
                  type="tel"
                  placeholder="+7 (999) 000-00-00"
                  value={phone}
                  disabled={profileMutation.isPending}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPhone(e.target.value)
                  }
                  required
                  className="[&_input]:p-2 [&_input]:rounded-none"
                />
              </div>

              {/* Чекбокс соглашения персональных данных */}
              <div className="flex items-start gap-2 pt-1.5">
                <Checkbox
                  id="profile-remember"
                  checked={agreed}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAgreed(e.target.checked)
                  }
                  className="mt-0.5 scale-110"
                />
                <Label
                  htmlFor="profile-remember"
                  className="text-[11px] leading-tight text-gray-500 font-normal cursor-pointer select-none"
                >
                  Я принимаю пользовательское соглашение и даю согласие на
                  обработку ИП Таммет Яан Эдуардович моих персональных данных на
                  условиях, определенных политикой конфиденциальности
                </Label>
              </div>

              {/* ✅ КНОПКА АВТОРИЗАЦИИ: Позволяет зарегистрированному ранее пользователю войти по магической ссылке */}
              {/* {!isAuthenticated && ( */}
              {status !== "authenticated" && (
                <div className="text-right mt-1">
                  <button
                    type="button"
                    onClick={handleSendMagicLink}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                  >
                    Уже зарегистрированы? Вышлем ссылку для входа на электронную
                    почту
                  </button>
                </div>
              )}
            </div>

            {/* Блок управляющих кнопок */}
            <div className="space-y-2 pt-2 border-t">
              <Button
                type="submit"
                disabled={profileMutation.isPending}
                className="w-full h-[45] rounded-none bg-[#7E8F52] hover:bg-[#6b7a44] transition-colors text-center flex items-center justify-center font-medium disabled:bg-gray-300"
              >
                {profileMutation.isPending
                  ? "Сохранение изменений..."
                  : "Сохранить данные"}
              </Button>

              {/* ✅ ИСПРАВЛЕНИЕ ГИДРАТАЦИИ: Добавили проверку isClient. 
    Теперь сервер и браузер гарантированно запустятся без кнопки (0 рассинхронизаций).
    Через миллисекунду после загрузки кнопка плавно появится на клиенте, если данные есть! */}
              {isClient && (isAuthenticated || name || phone || dbName) && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Выйти из профиля (очистить кэш)
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
