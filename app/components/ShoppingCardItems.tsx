import Image from "next/image";
import {orderArray} from "../orderArray";

export default function ShoppingCardItems () {
  const result = orderArray[0].goods.map((item, index) => {
    const itemAmount = item.bouquet.actionPrice || item.bouquet.price;
    const count = item.quantity;
    return (
      <div key={index} className="w-full h-[100] flex border-b mb-3">
        <div className="mr-0 lg:mr-5 pl-0 lg:pl-2 min-w-[70]">
          <Image
            src = {item.bouquet.image}
            alt = "Букет"
            width = {82}
            height = {84}
          />
        </div>
        <div className="flex flex-col justify-between pb-3 px-3 lg:px-0 w-40 lg:w-60">
          <div className="font-medium text-sm lg:text-base">{item.bouquet.title}</div>
          <div className="text-xs lg:text-base">{item.bouquet.description}</div>
        </div>
        <div className="flex justify-center items-center w-20 lg:w-30 scale-70 lg:scale-100">
          <button className="bg-[#B2B2B2] text-center px-3 py-1 rounded-bl-xl rounded-tl-xl">-</button>
          <div className="bg-[#eeeeee] text-center px-3 py-1">{count}</div>
          <button className="bg-[#B2B2B2] text-center px-3 py-1 rounded-br-xl rounded-tr-xl">+</button>
        </div>
        <div className="hidden lg:block">
          <div className="text-xs text-center">Цена за шт</div>
          <div className="w-20 text-center py-5 font-semibold">
            {itemAmount.toLocaleString('ru-RU')}
          </div>
        </div>
        <div>
          <div className="text-xs text-center">
            <span className="inline lg:hidden">Цена</span>
            <span className="hidden lg:inline">Всего</span>
          </div>
          <div className="flex flex-col lg:flex-row justify-center items-center">
            <div className="w-15 lg:w-25 text-center py-5 font-semibold">{(itemAmount * item.quantity).toLocaleString('ru-RU')}</div>
            <button>
              <Image
                src = "/deleteIcon.png"
                alt = "Удалить"
                width = {14}
                height = {15}
              />
            </button>
          </div>
        </div>
        
        
      </div>
    )
  })
  return result;
}