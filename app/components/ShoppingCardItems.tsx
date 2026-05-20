'use client';

import { useQuery } from "@tanstack/react-query";
import ShoppingItem from "./ShoppingItem";

// 1. Описываем строгие типы на основе реляционной схемы Prisma 7
interface ProductData {
  id: number;
  title: string;
  description: string;
  image: string;
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
  const res = await fetch('/api/cart');
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Ошибка загрузки корзины');
  return data;
};

export default function ShoppingCardItems() {
  // 2. Передаем интерфейс OrderData в обобщенный тип useQuery
  const { data: order, isLoading, error } = useQuery<OrderData, Error>({
    queryKey: ['cart'],
    queryFn: fetchCartData,
    refetchInterval: 5000, 
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <div className="p-8 text-center font-medium text-gray-500">Синхронизация корзины...</div>;
  if (error) return <div className="p-8 text-center text-rose-600 bg-rose-50">Ошибка: {error.message}</div>;

  const orderProducts = order?.orderProducts || [];

  if (orderProducts.length === 0) {
    return <div className="p-8 text-center text-gray-400 font-medium">Ваша корзина пуста</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-xl shadow-xs border">
      <div className="mb-4 pb-2 border-b flex justify-between items-center">
        <h2 className="font-bold text-gray-900">Ваш заказ #{order?.id}</h2>
        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-semibold">Активен</span>
      </div>

      <div className="space-y-1">
        {/* 3. ✅ ИСПРАВЛЕНИЕ: Теперь TS знает точную структуру каждого элемента orderItem */}
        {orderProducts.map((orderItem: OrderProductItem) => (
          <ShoppingItem key={orderItem.id} orderProduct={orderItem} />
        ))}
      </div>
    </div>
  );
}