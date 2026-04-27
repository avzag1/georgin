import { useStore } from '../store/useStore';
import Image from 'next/image';
import { Label, Textarea } from "flowbite-react";
import {orderArray} from "../orderArray";
import ShoppingCardItems from "./ShoppingCardItems";

export default function ShoppingCard () {
  const shoppingCardModal = useStore((state) => state.shoppingCardModal);
  const setShoppingCardModal = useStore((state) => state.setShoppingCardModal);
  const getShoppingCardClass = () => 
    `${shoppingCardModal === 1 ? 
      "flex w-[755] h-[597] bg-white border absolute inset-y-1/2 inset-x-[calc(50%-377px)]" 
      : "hidden"}`;
  return (
    <div className={getShoppingCardClass()}>
      <div className='relative w-full'>
        <button onClick={() => setShoppingCardModal(0)} className="absolute right-15 top-10">
          <Image
            src = "/closeIcon.png"
            alt = "Крест"
            width = {15}
            height = {17}
          />
        </button>

        <div className='w-full h-[81] bg-[#d9dac1] p-10 text-xl font-medium'>Корзина</div>

        <div className='w-full h-[240] p-10'>
          <ShoppingCardItems/>
        </div>

        <div>
          <div className="mb-2 block">
            <Label htmlFor="comment">Комментарий к заказу</Label>
          </div>
          <Textarea
            className="[&_input]:p-1"
            id="comment"
            placeholder="Ведите текст"
            rows={4}
          />
        </div>

        <div>
          {orderArray[0].totalAmount()}
        </div>

        <div>
          <button className='w-[221] h-[45] bg-[#B2B2B2] text-center'>
            Продолжить покупки
          </button>
          <button className='w-[330] h-[45] bg-[#7E8F52] text-center'>
            Перейти к оформлению заказа
          </button>
        </div>

      </div>
    </div>
  )
}