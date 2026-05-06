"use client"

import {Product} from "../orderArray";
import Image from "next/image";
import { useStore } from '../store/useStore';

export default function ShoppingItem ({item}: {item: Product}) {
  const order = useStore((state) => state.order);
  const setOrder = useStore((state) => state.setOrder);

  const currentProduct = order?.goods.find(p => p.bouquet.title === item.bouquet.title);
  const actualQuantity = currentProduct?.quantity || 0;
  const actualPrice = currentProduct?.bouquet.actionPrice || currentProduct?.bouquet.price || 0;
  
  
  const addCount = () => {
    if (!order || !currentProduct) return;
    const updatedGoods = order.goods.map((product) => {
      if (product.bouquet.title === item.bouquet.title) {
        const canAdd = actualQuantity < item.storedOrderQuantity;
        return { 
          ...product, 
          quantity: canAdd ? product.quantity + 1 : product.quantity 
        };
      }
      return product;
    });
    setOrder({ ...order, goods: updatedGoods });
  };
  const subtractCount = () => {
    if (!order || !currentProduct) return;
    const updatedGoods = order.goods.map((product) => {
      if (product.bouquet.title === item.bouquet.title) {
        const canSubtract = product.quantity > 1;
        return { 
          ...product, 
          quantity: canSubtract ? product.quantity - 1 : 1 
        };
      }
      return product;
    });
    setOrder({ ...order, goods: updatedGoods });
  };
  
  const itemPrice = item.bouquet.actionPrice || item.bouquet.price;

  return (
    <div className="w-full h-[100] flex border-b mb-3">
      <div className="mr-0 lg:mr-5 pl-0 lg:pl-2 min-w-[90]">
        <Image src={item.bouquet.image} alt="Букет" width={82} height={84} />
      </div>
      
      <div className="flex flex-col lg:flex-row">
        <div className="flex flex-col pb-3 pl-3 lg:pl-0 w-[145] lg:w-60">
          <div className="font-medium text-sm lg:text-base h-auto">{item.bouquet.title}</div>
          <div className="text-xs lg:text-base h-auto">{item.bouquet.description}</div>
        </div>

        <div className="flex justify-center items-center w-[56] lg:w-30 ml-8 lg:ml-0 scale-90 lg:scale-100">
          <button onClick={subtractCount} className="bg-[#B2B2B2] px-3 py-1 rounded-l-xl">-</button>
          <div className="bg-[#eeeeee] py-1 min-w-[30] text-center w-[21]">{(order?.goods.find(product => product.bouquet.title === item.bouquet.title)?.quantity)}</div>
          <button onClick={addCount} className="bg-[#B2B2B2] px-3 py-1 rounded-r-xl">+</button>
        </div>
      </div>

      <div className="w-[75] hidden lg:block">
        <div className="text-xs text-center">Цена за шт</div>
        <div className="flex items-center font-bold justify-center mt-5.5"><p>{(itemPrice).toLocaleString('ru-RU')}</p></div>
      </div>
      
      <div className="flex flex-col items-center ml-3 font-bold w-[61]">
        <div className="lg:hidden text-xs text-center font-normal">Цена</div>
        <div className="hidden lg:inline text-xs text-center font-normal">Всего</div>
        <div className="mt-5.5"><p>{(actualQuantity * actualPrice).toLocaleString('ru-RU')}</p></div>
      </div>

      <button onClick={()=>{
          if (!order) return;
          const updatedGoods = order.goods.filter(g => g !== item);
          setOrder({ ...order, goods: updatedGoods });
        }} className="flex justify-center items-center ml-2">
        <Image
          src = "/deleteIcon.png"
          alt = "Удалить"
          width = {16}
          height = {17}
        />
      </button>

    </div>
  );
}