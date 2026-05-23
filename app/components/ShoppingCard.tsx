"use client";

import { useStore } from "../store/useStore";
import Image from "next/image";
import { Label, Textarea, TextInput } from "flowbite-react";
import ShoppingCardItems from "./ShoppingCardItems";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

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

export default function ShoppingCard() {
  const queryClient = useQueryClient();
  const shoppingCardModal = useStore((state) => state.shoppingCardModal);
  const setShoppingCardModal = useStore((state) => state.setShoppingCardModal);

  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [comment, setComment] = useState("");

  // 1. ИСПРАВЛЕНИЕ ДЛЯ ЛИНТЕРА: Локальные стейты инициализируются строго через ленивые функции.
  // Никаких вызовов setState внутри эффектов больше нет!
  const [guestPhone, setGuestPhone] = useState<string>(() => {
    if (typeof window !== "undefined")
      return localStorage.getItem("guest_phone") || "";
    return "";
  });

  const [address, setAddress] = useState<string>(() => {
    if (typeof window !== "undefined")
      return localStorage.getItem("guest_address") || "";
    return "";
  });

  // Получаем телефон авторизованного пользователя из сессии PostgreSQL
  const dbPhone = (session?.user as unknown as { phone?: string })?.phone || "";

  // Перезаписываем стейт при вводе, чтобы контролируемый инпут обновлялся на ходу
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGuestPhone(val);
    if (!isAuthenticated) {
      localStorage.setItem("guest_phone", val);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    localStorage.setItem("guest_address", e.target.value);
  };

  const { data: order } = useQuery<OrderData>({
    queryKey: ["cart"],
    queryFn: fetchCartData,
  });

  const totalAmount =
    order?.orderProducts.reduce((sum, item) => {
      const actualPrice = item.product.actionPrice || item.product.price || 0;
      return sum + item.quantityInOrder * actualPrice;
    }, 0) ?? 0;

  // Мутация оформления заказа
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const guestName = localStorage.getItem("guest_name") || "Покупатель";

      // Определяем, какой телефон пойдет на бэкенд
      const finalPhone = isAuthenticated ? guestPhone || dbPhone : guestPhone;

      if (!finalPhone.trim())
        throw new Error("Укажите номер телефона для связи!");
      if (!address.trim()) throw new Error("Укажите адрес доставки!");

      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          guestPhone: finalPhone,
          guestAddress: address,
          comment: comment,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(data?.error || "Ошибка при оформлении заказа");
      return data;
    },
    onSuccess: () => {
      alert(`Заказ успешно оформлен! Ожидайте звонка оператора.`);
      setComment("");
      setAddress("");
      setGuestPhone("");
      if (!isAuthenticated) {
        localStorage.removeItem("guest_phone");
        localStorage.removeItem("guest_address");
        localStorage.removeItem("guest_cart");
      }
      setShoppingCardModal(0);

      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
    },
    onError: (err: Error) => {
      alert(`Ошибка: ${err.message}`);
    },
  });

  // Блокировка фонового скролла при открытой модалке (легальный эффект, т.к. внутри нет setState)
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
      <div className="relative w-full h-svh lg:h-auto pb-4 flex flex-col justify-between">
        <div>
          <button
            type="button"
            onClick={() => setShoppingCardModal(0)}
            className="absolute right-12 lg:right-15 top-8 lg:top-10 z-10"
          >
            <Image src="/closeIcon.png" alt="Крест" width={15} height={17} />
          </button>

          <div className="w-full h-[81] bg-[#d9dac1] px-10 pt-7 lg:p-10 text-xl font-medium">
            Корзина
          </div>

          <div className="w-full h-auto px-5 lg:px-10 py-5">
            <ShoppingCardItems />
          </div>

          <div className="grid grid-cols-1 gap-4 px-10 min-[260px]:max-[370px]:px-2 my-2">
            {/* Раздел телефона */}
            <div>
              <div className="mb-1 block">
                <Label htmlFor="cart-phone">Номер телефона*</Label>
              </div>
              <TextInput
                id="cart-phone-field"
                type="tel"
                placeholder="+7 (999) 000-00-00"
                // Используем currentPhone, который мы вычисляли ранее на лету
                value={isAuthenticated && !guestPhone ? dbPhone : guestPhone}
                required
                disabled={checkoutMutation.isPending}
                onChange={handlePhoneChange}
                className="[&_input]:p-2 [&_input]:rounded-none"
              />
            </div>

            {/* Поле Адреса */}
            <div>
              <div className="mb-1 block">
                <Label htmlFor="cart-address">Адрес доставки*</Label>
              </div>
              <Textarea
                id="cart-address"
                placeholder="Город, улица, дом, кв"
                rows={2}
                value={address}
                required
                disabled={checkoutMutation.isPending}
                onChange={handleAddressChange}
                className="p-2"
              />
            </div>
          </div>

          {/* Комментарий к заказу */}
          <div className="my-2 px-10 min-[260px]:max-[370px]:px-2">
            <div className="mb-1 block">
              <Label htmlFor="comment">Комментарий к заказу</Label>
            </div>
            <Textarea
              className="p-2"
              id="comment"
              placeholder="Дополнительные пожелания к сборке или доставке..."
              rows={2}
              value={comment}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setComment(event.target.value)
              }
            />
          </div>
        </div>

        <div>
          <div className="flex justify-end mt-2 mb-4 mr-20 font-semibold text-lg text-gray-900">
            <div>Итого:</div>
            <div className="mx-1 font-bold">
              {totalAmount.toLocaleString("ru-RU")}
            </div>
            <div>₽</div>
          </div>

          <div className="flex justify-between px-8 pb-6 min-[260px]:max-[370px]:px-2 text-xs lg:text-base text-white gap-4">
            <button
              type="button"
              onClick={() => {
                setShoppingCardModal(0);
                setComment("");
                setTimeout(() => {
                  const showcaseEl = document.getElementById("showcase");
                  if (showcaseEl)
                    showcaseEl.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className="w-[145] lg:w-[221] h-[45] bg-[#B2B2B2] text-center rounded-lg hover:bg-gray-500 transition-colors"
            >
              Продолжить покупки
            </button>
            <button
              type="button"
              disabled={checkoutMutation.isPending || totalAmount === 0}
              onClick={() => checkoutMutation.mutate()}
              className="w-[147] lg:w-[330] h-[45] bg-[#7E8F52] text-center rounded-lg hover:bg-[#6b7a44] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium"
            >
              {checkoutMutation.isPending
                ? "Оформление..."
                : "Перейти к оформлению заказа"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
