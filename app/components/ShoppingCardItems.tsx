import Image from "next/image";
import {orderArray} from "../orderArray";

export default function ShoppingCardItems () {
  const result = orderArray[0].goods.map((item, index) => {
    const itemAmount = item.bouquet.actionPrice || item.bouquet.price;
    const count = item.quantity;
    return (
      <div key={index} className="w-full h-[100] flex border-b mb-3">
        <div className="mr-5 pl-2">
          <Image
            src = {item.bouquet.image}
            alt = "Букет"
            width = {82}
            height = {84}
          />
        </div>
        <div className="flex flex-col justify-between pb-3 w-60">
          <div className="font-medium">{item.bouquet.title}</div>
          <div>{item.bouquet.description}</div>
        </div>
        <div className="flex justify-center items-center w-30">
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
          <div className="w-25 text-center py-5 font-semibold">{(itemAmount * item.quantity).toLocaleString('ru-RU')}</div>
        </div>
        
        <button>
          <Image
            src = "/deleteIcon.png"
            alt = "Удалить"
            width = {14}
            height = {15}
          />
        </button>
      </div>
    )
  })
  return result;
}