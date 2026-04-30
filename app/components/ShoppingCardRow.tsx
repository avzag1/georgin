"use client"

import { useState } from "react";
import {Product} from "../orderArray";
import Image from "next/image";

export default function ShoppingItem ({item}: {item: Product}) {
  const [count, setCount] = useState(item.quantity);
  
  const addCount = () => setCount(prev => prev + 1);
  const subtractCount = () => setCount(prev => (prev > 1 ? prev - 1 : 1));
  
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
          <div className="bg-[#eeeeee] py-1 min-w-[30px] text-center w-[21]">{count}</div>
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
        <div className="mt-5.5"><p>{(itemPrice * count).toLocaleString('ru-RU')}</p></div>
      </div>

      <button onClick={()=>{}} className="flex justify-center items-center ml-2">
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