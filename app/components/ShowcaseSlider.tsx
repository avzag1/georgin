"use client";

import HitsSlider from "./HitsSlider";
import { useStore } from "../store/useStore";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type {Bouquet} from "../type/bouquet"

export const dynamic = 'force-dynamic';

interface ProductItem {
  id: number;
  image: string;
  title: string;
  description: string;
  price: number;
  actionPrice: number;
  quantityInStore: number;
  categoryName: string;
}

interface CategoryItem {
  id: number;
  category: string;
}

const fetchProducts = async (): Promise<ProductItem[]> => {
  const res = await fetch("/api/products?archived=false"); // ◄ Добавили фильтр склада
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Ошибка загрузки каталога");
  return data || [];
};

const fetchCategories = async (): Promise<CategoryItem[]> => {
  const res = await fetch("/api/categories");
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Ошибка загрузки категорий");
  return data || [];
};

interface ShowcaseProps {
  array: Bouquet[];
}

export default function ShowcaseSlider({array}: ShowcaseProps) {
  const [visible, setVisible] = useState(false);

  // Zustand-стейты
  const toggle = useStore((state) => state.toggle);
  const setToggle = useStore((state) => state.setToggle);

  // 1. ЗАГРУЗКА ДАННЫХ ИЗ POSTGRESQL
  const { data: products = [], isLoading: isProductsLoading } = useQuery<
    ProductItem[]
  >({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { data: dbCategories = [], isLoading: isCatsLoading } = useQuery<
    CategoryItem[]
  >({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Автоматически выбираем первую категорию из БД при инициализации,
  // если текущий toggle не соответствует ни одной из них
  useEffect(() => {
    if (dbCategories.length > 0) {
      const isCurrentToggleValid = dbCategories.some(
        (cat) => cat.id === toggle,
      );
      if (!isCurrentToggleValid) {
        setToggle(dbCategories[0].id); // Записываем ID первой категории СУБД в Zustand
      }
    }
  }, [dbCategories, toggle, setToggle]);

  const toggleVisible = (): void => {
    setVisible(!visible);
  };

  // Находим объект выбранной категории по её ID (который теперь лежит в toggle)
  const currentCategoryObj = dbCategories.find((cat) => cat.id === toggle);
  const currentCategoryName = currentCategoryObj
    ? currentCategoryObj.category
    : "";

  // Фильтруем продукты по имени выбранной категории
  const filteredArray = products.filter(
    (item) => item.categoryName === currentCategoryName,
  );

  // const repeatedArray =
  //   filteredArray.length > 0 ? Array(8).fill(filteredArray).flat() : [];
  const repeatedArray =
    array.length > 0 ? Array(8).fill(filteredArray).flat() : [];

  const getBtnClass = (id: number) =>
    `w-45 h-auto min-h-9 border border-[#2D531A] lg:border-[#9AB973] text-[#2D531A] text-left lg:text-center text-xs lg:text-base rounded-4xl lg:rounded-none justify-between lg:justify-center items-center px-3 lg:px-0 cursor-pointer hover:bg-[#e3e9db] transition-colors duration-200 min-[260px]:max-[340px]:ml-5 ${
      toggle === id
        ? "lg:bg-[#9AB973] flex"
        : visible === true
          ? "lg:bg-white/0"
          : "hidden lg:block"
    }`;

  if (isProductsLoading || isCatsLoading) {
    return (
      <div className="p-12 text-center font-medium text-gray-500">
        Синхронизация витрины с базой данных...
      </div>
    );
  }

  return (
    <div>
      <div className="flex min-[260px]:max-[340px]:flex-col">
        <div className="flex lg:hidden ml-10 mr-0 lg:mx-12">
          <div className="mt-5">
            <Image
              className="mx-auto h-auto"
              src="/catalogTitle.png"
              alt="Каталог"
              width={192}
              height={51}
            />
          </div>
        </div>

        {/* Автоматический рендеринг кнопок через .map() */}
        <div className="w-full lg:w-3/5 flex flex-col lg:flex-row justify-around  mt-5 lg:mt-0 mb-2 mx-auto lg:mx-25 relative lg:gap-2 gap-0">
          {dbCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              // Записываем ID категории из PostgreSQL напрямую в Zustand-стейт toggle
              onClick={() => {
                setToggle(cat.id);
                setVisible(false);
              }}
              className={getBtnClass(cat.id)}
            >
              <p className="ml-3 lg:ml-0 max-w-[130] lg:max-w-[200]">{cat.category}</p>
            </button>
          ))}

          {/* Стрелочка для мобильного выпадающего списка */}
          {dbCategories.length > 0 && (
            <button
              type="button"
              onClick={toggleVisible}
              className="absolute min-[260px]:max-[340px]:left-40 left-37 top-2 block lg:hidden min-w-[24]"
            >
              <Image
                className={visible ? "transition-transform duration-200 rotate-180" : "transition-transform duration-200 rotate-0"}
                src="/dropIcon.png"
                alt="Выпадающий список"
                width={24}
                height={26}
              />
            </button>
          )}
        </div>
      </div>

      {repeatedArray.length === 0 ? (
        <div className="p-16 text-center text-gray-400 font-light">
          Букеты из секции &quot;{currentCategoryName || "Выбранной категории"}
          &quot; скоро появятся на витрине
        </div>
      ) : (
        <HitsSlider array={repeatedArray} high="h-1400" rows={2} loop={false} />
      )}
    </div>
  );
}
