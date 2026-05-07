"use client"

import {Bouquet} from "../type/bouquet";
import { useStore } from '../store/useStore';
import {storeArray} from "../storeArray";
import {Category} from "../orderArray";
import { useState, useEffect } from "react";

export default function OrderBouquetButton ({ bgColor, bouquet }: { bgColor: string, bouquet: Bouquet }) {
  const order = useStore((state) => state.order);
  const setOrder = useStore((state) => state.setOrder);
  const setShoppingCardModal = useStore((state) => state.setShoppingCardModal);
  const [confirmOrderModal, setConfirmOrderModal] = useState(0);

  const currentProductInStore = storeArray.find(p => p.title === bouquet.title);
  const actualQuantityInStore = currentProductInStore?.quantity || 0;
  const actualQuantityInOrder = order?.goods.find(item => item.bouquet.title === bouquet.title)?.quantity;

  const handleOrder = () => {
    setConfirmOrderModal(1);
  };

  useEffect(() => {
    if (confirmOrderModal === 1) {
      const timer = setTimeout(() => setConfirmOrderModal(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmOrderModal]);

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
          bouquet: {
            ...bouquet,
            category: bouquet.category as Category
          }
        };
        setOrder({ ...order, goods: [...order.goods, newGood] });
      }
    }
    handleOrder();
    
  }

  return (
    <button onClick = {addBouquet} className={`relative flex items-center justify-center w-[155] lg:w-[132] h-[49] text-xl font-extralight antialiased text-white rounded-4xl lg:rounded-none ${bgColor}`}>
      <p>Заказать</p>
      <div className={`
        flex flex-col items-center justify-center w-70 h-14 absolute -top-16 right-0 bg-amber-100 rounded-3xl text-black text-sm z-40 transition-all duration-700 ease-in-out
        ${confirmOrderModal === 1 
          ? "opacity-100 translate-y-0 pointer-events-auto" 
          : "opacity-0 translate-y-2 pointer-events-none"}
      `}>
        <div className={actualQuantityInOrder && actualQuantityInOrder < actualQuantityInStore ? "block" : "hidden"}>Добавлено в корзину</div>
        <div>Всего в <span className="font-bold" onClick={()=>setShoppingCardModal(1)}>корзине</span> таких товаров {actualQuantityInOrder}</div>
        <div className={actualQuantityInOrder === actualQuantityInStore ? "block" : "hidden"}>Это максимальное количество</div>
      </div>
    </button>
  )
}