"use client";

import { Bouquet } from "../type/bouquet";
import { useStore } from "../store/useStore";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

const fetchCartData = async (): Promise<OrderData> => {
  const res = await fetch("/api/cart");
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Ошибка загрузки корзины");
  return data;
};

const addToCartRequest = async (productId: number) => {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok)
    throw new Error(data?.error || "Не удалось добавить товар в корзину");
  return data;
};

export default function OrderBouquetButton({
  bgColor,
  bouquet,
  forActions = false,
}: {
  bgColor: string;
  bouquet: Bouquet;
  forActions?: boolean;
}) {
  const queryClient = useQueryClient();
  const setShoppingCardModal = useStore((state) => state.setShoppingCardModal);
  const [confirmOrderModal, setConfirmOrderModal] = useState(0);

  const bouquetFields = bouquet as unknown as {
    id: number;
    quantityInStore: number;
  };

  const { data: cartData } = useQuery<OrderData>({
    queryKey: ["cart"],
    queryFn: fetchCartData,
  });

  const currentCartItem = cartData?.orderProducts.find(
    (item) => item.product.title === bouquet.title,
  );

  const actualQuantityInOrder = currentCartItem?.quantityInOrder || 0;
  const actualQuantityInStore =
    currentCartItem?.product.quantityInStore ??
    bouquetFields.quantityInStore ??
    0;

  // Настраиваем мутацию добавления
  const mutation = useMutation({
    mutationFn: addToCartRequest,
    onSuccess: () => {
      // 1. Показываем плашку СРАЗУ при успешном ответе сервера
      setConfirmOrderModal(1);

      // 2. Инвалидируем кэш. Он обновится в фоне за миллисекунды
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["products"], exact: false });

      const channel = new BroadcastChannel("shop_cart_updates");
      channel.postMessage("cart_changed");
      channel.close();
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  // Отдельный легитимный эффект для закрытия плашки по таймеру (не вызывает каскадных рендеров)
  useEffect(() => {
    if (confirmOrderModal === 1) {
      const timer = setTimeout(() => setConfirmOrderModal(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmOrderModal]);

  const addBouquet = () => {
    if (actualQuantityInOrder >= actualQuantityInStore) {
      setConfirmOrderModal(1);
      return;
    }
    if (!bouquetFields.id) {
      alert("Ошибка: у товара отсутствует идентификатор ID");
      return;
    }
    mutation.mutate(bouquetFields.id);
  };

  const isOutOfStock = actualQuantityInStore === 0;

  // Вычисляем число для отображения на плашке:
  // Если мутация выполняется или только что завершилась, но кэш ещё не успел прилететь с сервера,
  // мы принудительно показываем пользователю (текущее количество + 1). Как только кэш обновится,
  // значение плавно заменится на реальную цифру из БД.
  const displayedQuantity =
    mutation.isPending || (confirmOrderModal === 1 && mutation.isSuccess)
      ? actualQuantityInOrder
      : actualQuantityInOrder;

  return (
    <button
      type="button"
      disabled={mutation.isPending || isOutOfStock}
      onClick={addBouquet}
      className={`relative flex items-center justify-center w-[155] ${forActions ? 'w-[170] border' : 'lg:w-[132] bgColor'} h-[49] text-xl font-extralight antialiased text-white rounded-4xl lg:rounded-none cursor-pointer
      transition-colors duration-200 hover:bg-[#57613f]
      active:bg-[#d7e6b2] active:text-[#242918] disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed`}
    >
      <span className="leading-none select-none">
        {isOutOfStock ? "Нет" : forActions ? "Купить сейчас" : "Заказать"}
      </span>

      {/* ИНТЕРАКТИВНОЕ ПРЕВЬЮ СОСТОЯНИЯ КОРЗИНЫ */}
      <div
        className={`
        flex flex-col items-center justify-center w-[290] h-16 absolute -top-20 right-0 bg-amber-100 rounded-3xl text-black text-xs z-40 transition-all duration-500 ease-in-out border border-amber-200 shadow-md px-2
        ${
          confirmOrderModal === 1
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-2 pointer-events-none"
        }
      `}
      >
        <div
          className={
            displayedQuantity > 0 && displayedQuantity <= actualQuantityInStore
              ? "block text-emerald-700 font-semibold mb-0.5"
              : "hidden"
          }
        >
          ✓ Добавлено в корзину
        </div>

        <div className="text-center">
          Всего в{" "}
          <span
            className="font-bold text-indigo-600 underline cursor-pointer"
            onClick={(e) => {
              // ✅ ИСПРАВЛЕНИЕ: Блокируем всплытие клика к родительской кнопке "Заказать"
              e.stopPropagation();
              setShoppingCardModal(1);
            }}
          >
            корзине
          </span>{" "}
          таких товаров:{" "}
          <span className="font-bold text-sm">{displayedQuantity}</span> шт.
        </div>

        <div
          className={
            displayedQuantity >= actualQuantityInStore &&
            actualQuantityInStore > 0
              ? "block text-rose-700 font-semibold mt-0.5"
              : "hidden"
          }
        >
          ⚠ Это максимальное количество на складе
        </div>
      </div>
    </button>
  );
}
