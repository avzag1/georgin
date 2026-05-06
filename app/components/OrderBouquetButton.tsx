"use client"

import {Bouquet} from "../type/bouquet";
import { useStore } from '../store/useStore';
import {storeArray} from "../storeArray";

export default function OrderBouquetButton ({ bgColor, bouquet }: { bgColor: string, bouquet: Bouquet }) {
  const order = useStore((state) => state.order);
  const setOrder = useStore((state) => state.setOrder);

  const currentProductInStore = storeArray.find(p => p.title === bouquet.title);
  const currentProductInOrder = order?.goods.find(p => p.bouquet.title === bouquet.title);
  const actualQuantityInStore = currentProductInStore?.quantity || 0;

  const addBouquet = () => {
    if (!order) return;
    const isExist = order.goods.find(p => p.bouquet.title === bouquet.title);
    if (isExist) {
      const updatedGoods = order.goods.map((product) => {
        if (product.bouquet.title === bouquet.title) {
          const canAdd = product.quantity < actualQuantityInStore;
          return { ...product, quantity: canAdd ? product.quantity + 1 : product.quantity };
        }
        return product;
      });
      setOrder({ ...order, goods: updatedGoods });
    } else {
      if (actualQuantityInStore > 0) {
        const newGood = {
          quantity: 1,
          storedOrderQuantity: actualQuantityInStore,
          bouquet: bouquet
        };
        setOrder({ ...order, goods: [...order.goods, newGood] });
      }
    }
  }

  return (
    <button onClick = {addBouquet} className={`flex items-center justify-center w-[155] lg:w-[132] h-[49] text-xl font-extralight antialiased text-white rounded-4xl lg:rounded-none ${bgColor}`}>
      Заказать
    </button>
  )
}