"use client"

import { useStore } from '../store/useStore';
import Image from 'next/image';
import { Label, Textarea } from "flowbite-react";
import ShoppingCardItems from "./ShoppingCardItems";
import { useState, useEffect } from "react";

export default function ShoppingCard () {
  const shoppingCardModal = useStore((state) => state.shoppingCardModal);
  const setShoppingCardModal = useStore((state) => state.setShoppingCardModal);
  const order = useStore((state) => state.order);

  const [comment, setComment] = useState('');

  useEffect(() => {
    if (shoppingCardModal !== 0) {
      // 1. Находим ширину скроллбара
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      // 2. Блокируем скролл и добавляем отступ
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      // 3. Возвращаем всё как было
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    // На всякий случай очищаем стили при размонтировании компонента
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [shoppingCardModal]);

  const getShoppingCardClass = () => 
    `${shoppingCardModal === 1 ? 
      "flex w-full lg:w-[755] h-screen min-h-[660] lg:max-h-screen lg:h-auto bg-white border-none lg:border lg:border-solid fixed z-80 top-0 left-0 lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 overflow-y-auto" 
      : "hidden"}`;
  return (
    <div className={getShoppingCardClass()}>
      <div className='relative w-full h-svh lg:h-auto'>
        <button onClick={() => setShoppingCardModal(0)} className="absolute right-12 lg:right-15 top-8 lg:top-10">
          <Image
            src = "/closeIcon.png"
            alt = "Крест"
            width = {15}
            height = {17}
          />
        </button>

        <div className='w-full h-[81] bg-[#d9dac1] px-10 pt-7 lg:p-10 text-xl font-medium'>
          Корзина
        </div>

        <div className='w-full h-auto px-5 lg:px-10 py-5'>
          <ShoppingCardItems/>
        </div>

        <div className='my-5 px-10'>
          <div className="mb-2 block">
            <Label htmlFor="comment">Комментарий к заказу</Label>
          </div>
          <Textarea
            className="p-3"
            id="comment"
            placeholder="Введите текст"
            rows={4}
            value={comment}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setComment(event.target.value)}
          />
        </div>
        
        <div className='flex justify-end mt-10 mb-5 mr-20 font-semibold'>
          <div>Итого:</div>
          <div className='mx-1'>
            {order ? order.totalAmount().toLocaleString('ru-RU') : 0}
          </div>
          <div>&#8381;</div>
        </div>

        <div className='flex justify-between px-8 pb-10 text-xs lg:text-base text-white'>
          <button onClick={() => {
            setShoppingCardModal(0);
            setComment("");
            setTimeout(() => {
              document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
            className='w-[145] lg:w-[221] h-[45] bg-[#B2B2B2] text-center'>
            Продолжить покупки
          </button>
          <button className='w-[147] lg:w-[330] h-[45] bg-[#7E8F52] text-center'>
            Перейти к оформлению заказа
          </button>
        </div>
      </div>
    </div>
  )
}