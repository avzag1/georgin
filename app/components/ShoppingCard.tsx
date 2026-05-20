"use client";

import { useStore } from "../store/useStore";
import Image from "next/image";
import { Label, Textarea } from "flowbite-react";
import ShoppingCardItems from "./ShoppingCardItems";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface ProductData {
  id: number;
  title: string;
  price: number;
  actionPrice: number;
  quantityInStore: number;
}

interface OrderProductItem {
  id: number;
  quantityInOrder: number;
  product: ProductData;
}

interface OrderData {
  id: number;
  status: string;
  orderProducts: OrderProductItem[];
}

// 1. Функция-загрузчик должна быть объявлена ВНЕ компонента:
const fetchCartData = async (): Promise<OrderData> => {
  const res = await fetch('/api/cart');
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Ошибка загрузки корзины');
  return data;
};

export default function ShoppingCard() {
  const shoppingCardModal = useStore((state) => state.shoppingCardModal);
  const setShoppingCardModal = useStore((state) => state.setShoppingCardModal);
  const [comment, setComment] = useState('');

  // 2. ИСПРАВЛЕННЫЙ ВЫЗОВ ХУКА (Проверьте, что queryFn написана внутри):
  const { data: order } = useQuery<OrderData>({
    queryKey: ['cart'],
    queryFn: fetchCartData, // ◄ Ошибка исчезнет благодаря этой строке
  });

  // Логика подсчета итоговой суммы
  const totalAmount = order?.orderProducts.reduce((sum, item) => {
    const actualPrice = item.product.actionPrice || item.product.price || 0;
    return sum + (item.quantityInOrder * actualPrice);
  }, 0) ?? 0;

  useEffect(() => {
    if (shoppingCardModal !== 0) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [shoppingCardModal]);

  const getShoppingCardClass = () =>
    `${
      shoppingCardModal === 1
        ? "flex w-full lg:w-[755px] h-screen min-h-[660px] lg:max-h-screen lg:h-auto bg-white border-none lg:border lg:border-solid fixed z-80 top-0 left-0 lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 overflow-y-auto"
        : "hidden"
    }`;

  return (
    <div className={getShoppingCardClass()}>
      <div className="relative w-full h-svh lg:h-auto">
        <button
          type="button"
          onClick={() => setShoppingCardModal(0)}
          className="absolute right-12 lg:right-15 top-8 lg:top-10"
        >
          <Image src="/closeIcon.png" alt="Крест" width={15} height={17} />
        </button>

        <div className="w-full h-[81] bg-[#d9dac1] px-10 pt-7 lg:p-10 text-xl font-medium">
          Корзина
        </div>

        <div className="w-full h-auto px-5 lg:px-10 py-5">
          <ShoppingCardItems />
        </div>

        <div className="my-5 px-10 min-[260px]:max-[370px]:px-2">
          <div className="mb-2 block">
            <Label htmlFor="comment">Комментарий к заказу</Label>
          </div>
          <Textarea
            className="p-3"
            id="comment"
            placeholder="Введите текст"
            rows={4}
            value={comment}
            // 4. ИСПРАВЛЕНИЕ ТИПА: Изменено с HTMLInputElement на HTMLTextAreaElement
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
              setComment(event.target.value)
            }
          />
        </div>

        <div className="flex justify-end mt-10 mb-5 mr-20 font-semibold text-lg text-gray-900">
          <div>Итого:</div>
          {/* 5. Выводим рассчитанную сумму в реальном времени */}
          <div className="mx-1 font-bold">
            {totalAmount.toLocaleString("ru-RU")}
          </div>
          <div>₽</div>
        </div>

        <div className="flex justify-between px-8 pb-10 min-[260px]:max-[370px]:px-2 text-xs lg:text-base text-white">
          <button
            type="button"
            onClick={() => {
              setShoppingCardModal(0);
              setComment("");
              setTimeout(() => {
                document
                  .getElementById("showcase")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            className="w-[145] lg:w-[221] h-[45] bg-[#B2B2B2] text-center rounded-lg hover:bg-gray-500 transition-colors"
          >
            Продолжить покупки
          </button>
          <button
            type="button"
            className="w-[147] lg:w-[330] h-[45] bg-[#7E8F52] text-center rounded-lg hover:bg-[#6b7a44] transition-colors"
          >
            Перейти к оформлению заказа
          </button>
        </div>
      </div>
    </div>
  );
}
