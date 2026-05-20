'use client';

import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CartProductProps {
  orderProduct: {
    id: number;
    quantityInOrder: number;
    product: {
      id: number;
      title: string;
      description: string;
      image: string;
      price: number;
      actionPrice: number;
      quantityInStore: number;
    };
  };
}

const updateCartApi = async (body: { orderProductId: number; quantity?: number; action?: string }) => {
  const res = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
};

export default function ShoppingItem({ orderProduct }: CartProductProps) {
  const queryClient = useQueryClient();
  const { product, quantityInOrder, id: orderProductId } = orderProduct;

  // Мутация для любых изменений внутри этой строки
  const cartMutation = useMutation({
    mutationFn: updateCartApi,
    onSuccess: () => {
      // 1. Обновляем саму корзину
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      // 2. ✅ ИСПРАВЛЕНИЕ: Добавляем exact: false.
      // Теперь при изменении количества в корзине TanStack Query сбросит 
      // ВСЕ кэши, начинающиеся со слова 'products', и админка сразу обновит цифру!
      queryClient.invalidateQueries({ queryKey: ['products'], exact: false });
      
      // 3. Отправляем сигнал в соседнюю вкладку
      const channel = new BroadcastChannel('shop_cart_updates');
      channel.postMessage('cart_changed');
      channel.close();
    },
  });

  const actualPrice = product.actionPrice || product.price || 0;

  const addCount = () => {
    if (quantityInOrder < product.quantityInStore) {
      cartMutation.mutate({ orderProductId, quantity: quantityInOrder + 1 });
    }
  };

  const subtractCount = () => {
    if (quantityInOrder > 1) {
      cartMutation.mutate({ orderProductId, quantity: quantityInOrder - 1 });
    }
  };

  return (
    <div className="w-full flex flex-row min-[260px]:max-[360px]:flex-col border-b mb-3 pb-3 items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="min-w-[82]">
          <Image src={product.image || '/placeholder.png'} alt={product.title} width={82} height={84} className="object-cover rounded" />
        </div>

        <div className="flex flex-col">
          <div className="font-medium text-sm lg:text-base">{product.title}</div>
          <div className="text-xs text-gray-500 max-w-xs">{product.description}</div>
          
          {/* Счётчик */}
          <div className="flex items-center mt-2">
            <button type="button" onClick={subtractCount} disabled={quantityInOrder <= 1 || cartMutation.isPending} className="bg-gray-200 px-3 py-1 rounded-l-xl disabled:opacity-50">-</button>
            <div className="bg-gray-100 py-1 px-4 text-center min-w-[40] text-sm font-semibold">{quantityInOrder}</div>
            <button type="button" onClick={addCount} disabled={quantityInOrder >= product.quantityInStore || cartMutation.isPending} className="bg-gray-200 px-3 py-1 rounded-r-xl disabled:opacity-50">+</button>
          </div>
        </div>
      </div>

      <div className="flex flex-row min-[260px]:max-[630px]:flex-col gap-3 items-center">
        <div className="text-right min-w-20">
          <div className="text-xs text-center text-gray-400">Всего</div>
          <div className="font-bold text-sm text-center lg:text-base text-gray-900 mt-1">
            {((quantityInOrder * actualPrice)).toLocaleString("ru-RU")} ₽
          </div>
        </div>

        {/* Удаление */}
        <button
          type="button"
          disabled={cartMutation.isPending}
          onClick={() => {
            if (window.confirm('Удалить позицию из корзины?')) {
              cartMutation.mutate({ orderProductId, action: 'delete' });
            }
          }}
          className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <Image src="/deleteIcon.png" alt="Удалить" width={16} height={17} />
        </button>
      </div>
    </div>
  );
}