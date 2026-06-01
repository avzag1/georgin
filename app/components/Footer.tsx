"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "../store/useStore";
import { useQuery } from "@tanstack/react-query";
import Support from "../components/Support";
import SubscribeForm from "../components/SubscribeForm";

// 1. СТРОГИЕ ИНТЕРФЕЙСЫ ДЛЯ TYPESCRIPT
interface CategoryItem {
  id: number;
  category: string;
}

interface DropItems {
  closed: boolean;
  about: boolean;
  clients: boolean;
  catalog: boolean;
  contacts: boolean;
  schedule: boolean;
}

// Загрузчик категорий (TanStack Query дедуплицирует этот запрос с витриной)
const fetchFooterCategories = async (): Promise<CategoryItem[]> => {
  const res = await fetch("/api/categories");
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Ошибка загрузки категорий");
  return data || [];
};

export default function Footer() {
  // Состояния из Zustand-стора
  const setToggle = useStore((state) => state.setToggle);
  const setSupportModal = useStore((state) => state.setSupportModal);
  
  // Локальное состояние для мобильных выпадающих списков
  const [drop, setDrop] = useState<keyof DropItems>("closed");

  // Подключаемся к общему кэшу категорий базы данных
  const { data: dbCategories = [], isLoading } = useQuery<CategoryItem[], Error>({
    queryKey: ["categories"],
    queryFn: fetchFooterCategories,
  });

  const toggleDrop = (id: keyof DropItems): void => {
    if (drop === id) {
      setDrop("closed");
    } else {
      setDrop(id);
    }
  };

  return (
    <footer className="w-full h-auto lg:h-[374] mx-auto bg-[#F5F2ED] flex flex-col justify-between px-5 pb-10 lg:p-10 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row justify-around order-2 lg:order-1">
        
        {/* БЛОК 1: О нас */}
        <div className="h-auto lg:h-[140] flex flex-col text-[#394128] text-sm pl-7 lg:pl-0 border-b border-b-gray-400 lg:border-none">
          <div className="py-2 pr-2 font-normal lg:font-semibold text-black flex justify-between">
            <div>О нас</div>
            <button
              type="button"
              onClick={() => toggleDrop("about")}
              className={`flex justify-center items-center lg:hidden transition-transform ${drop === "about" ? "rotate-180" : "rotate-0"}`}
            >
              <Image
                src="/dropIconFooter.png"
                alt="Развернуть"
                width={14}
                height={16}
              />
            </button>
          </div>
          <div
            className={
              drop === "about" ? "flex flex-col" : "hidden lg:flex lg:flex-col"
            }
          >
            <div className="py-2">Контакты</div>
            <div className="py-2">Отзывы</div>
            <button
              type="button"
              onClick={() => setSupportModal(1)}
              className="py-2 text-left"
            >
              Поддержка
            </button>
          </div>
        </div>

        {/* БЛОК 2: Покупателям */}
        <div className="h-auto lg:h-[140] flex flex-col justify-between text-[#394128] text-sm pl-7 lg:pl-0 pb-2 border-b border-b-gray-400 lg:border-none">
          <div className="py-2 font-normal lg:font-semibold text-black flex justify-between pr-2">
            <div>Покупателям</div>
            <button
              type="button"
              onClick={() => toggleDrop("clients")}
              className={`flex justify-center items-center lg:hidden transition-transform ${drop === "clients" ? "rotate-180" : "rotate-0"}`}
            >
              <Image
                src="/dropIconFooter.png"
                alt="Развернуть"
                width={14}
                height={16}
              />
            </button>
          </div>
          <div
            className={
              drop === "clients" ? "flex flex-col" : "hidden lg:flex lg:flex-col"
            }
          >
            <Link href="#howToOrder" className="py-2">
              Как заказать
            </Link>
            <Link href="#actions" className="py-2">
              Акции
            </Link>
            <div className="py-2">Доставка</div>
          </div>
        </div>

        {/* БЛОК 3: Каталог (Динамическая генерация из PostgreSQL) */}
        <div className="h-auto lg:h-[140] flex flex-col justify-between text-[#394128] text-sm pl-7 lg:pl-0 pb-2 border-b border-b-gray-400 lg:border-none">
          <div className="py-2 pr-2 font-normal lg:font-semibold text-black flex justify-between">
            <div>Каталог</div>
            <button
              type="button"
              onClick={() => toggleDrop("catalog")}
              className={`flex justify-center items-center lg:hidden transition-transform ${drop === "catalog" ? "rotate-180" : "rotate-0"}`}
            >
              <Image
                src="/dropIconFooter.png"
                alt="Развернуть"
                width={14}
                height={16}
              />
            </button>
          </div>
          <div
            className={
              drop === "catalog" ? "flex flex-col" : "hidden lg:flex lg:flex-col"
            }
          >
            <Link href="#hits" className="py-2 hover:text-[#2D531A] transition-colors">
              Хиты сезона
            </Link>

            {isLoading && <div className="py-2 text-xs text-gray-400">Синхронизация...</div>}

            {/* Маппинг реальных категорий из БД */}
            {!isLoading && dbCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  // Передаем реальный ID категории из базы данных в стейт toggle
                  setToggle(cat.id);
                  // Скроллим к ShowcaseSlider витрине
                  document
                    .getElementById("showcase")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="py-2 text-left hover:text-[#2D531A] transition-colors select-none"
              >
                {cat.category}
              </button>
            ))}

            {!isLoading && dbCategories.length === 0 && (
              <div className="py-2 text-xs text-gray-400 italic">Нет активных рубрик</div>
            )}
          </div>
        </div>

        {/* БЛОК 4: Контакты и Режим работы */}
        <div className="flex flex-col">
          {/* Контакты */}
          <div className="h-auto lg:h-[140] flex flex-col justify-between text-[#394128] text-sm pl-7 lg:pl-0 pb-2 border-b border-b-gray-400 lg:border-none">
            <div className="py-2 pr-2 font-normal lg:font-semibold text-black flex justify-between">
              <div>Контакты</div>
              <button
                type="button"
                onClick={() => toggleDrop("contacts")}
                className={`flex justify-center items-center lg:hidden transition-transform ${drop === "contacts" ? "rotate-180" : "rotate-0"}`}
              >
                <Image
                  src="/dropIconFooter.png"
                  alt="Развернуть"
                  width={14}
                  height={16}
                />
              </button>
            </div>
            <div
              className={
                drop === "contacts" ? "flex flex-col" : "hidden lg:flex lg:flex-col"
              }
            >
              <div className="py-2 lg:py-1">+7 (937) 938-87-77</div>
              <div className="py-2 lg:py-1">г. Йошкар-Ола</div>
              <div className="py-2 lg:py-1">Я. Крастыня 2В, Мира 113А,</div>
              <div className="py-2 lg:py-1">Красноармейская улица 103 к1</div>
            </div>
          </div>

          {/* Режим работы */}
          <div className="mt-0 lg:mt-4 mb-2 h-auto lg:h-[50] flex flex-col justify-between text-[#394128] text-sm pl-7 lg:pl-0 border-b border-b-gray-400 lg:border-none">
            <div className="py-2 pr-2 font-normal lg:font-semibold text-black flex justify-between">
              <div>Режим работы</div>
              <button
                type="button"
                onClick={() => toggleDrop("schedule")}
                className={`flex justify-center items-center lg:hidden transition-transform ${drop === "schedule" ? "rotate-180" : "rotate-0"}`}
              >
                <Image
                  src="/dropIconFooter.png"
                  alt="Развернуть"
                  width={14}
                  height={16}
                />
              </button>
            </div>
            <div
              className={
                drop === "schedule" ? "py-2" : "hidden lg:flex lg:flex-col"
              }
            >
              ПН-ВС, с 9:00 до 21:00
            </div>
          </div>
        </div>

        {/* БЛОК 5: Логотип и социальные сети */}
        <div className="flex flex-col items-center">
          <Image
            className="ml-5 order-2 lg:order-1 h-auto"
            src="/logoFooter.png"
            alt="Логотип"
            width={219}
            height={72}
          />

          <div className="flex justify-center w-full mt-5 lg:mt-3 mb-7 lg:mb-0 order-1 lg:order-2 border-b lg:border-none">
            <a href="https://t.me" target="_blank" rel="noopener noreferrer">
              <Image
                className="m-2"
                src="/telegramIcon.png"
                alt="Телеграм"
                width={25}
                height={26}
              />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="m-2"
                src="/instagramIcon.png"
                alt="Инстаграм"
                width={26}
                height={25}
              />
            </a>
            <a href="https://vk.com" target="_blank" rel="noopener noreferrer">
              <Image
                className="m-2"
                src="/VKIcon.png"
                alt="Вконтакте"
                width={25}
                height={25}
              />
            </a>
          </div>
        </div>
      </div>

      {/* НИЖНЯЯ СТРОКА: Копирайт и Подписка */}
      <div className="mb-5 lg:mb-0 flex justify-between mt-7 w-full order-1 lg:order-2 mx-auto lg:mx-0">
        <div className="hidden lg:flex items-end ml-15 text-xs text-gray-400">
          &copy; 2026 Copyright
        </div>
        <div className="flex flex-col w-[620] max-w-screen">
          <div className="font-medium text-center lg:text-left text-xs lg:text-base mb-3 lg:mb-0 text-gray-800">
            Узнайте первыми о самых выгодных акциях и предложениях
          </div>
          <SubscribeForm />
        </div>
      </div>
      <Support />
    </footer>
  );
}