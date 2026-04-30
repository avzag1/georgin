"use client"

import Link from "next/link";
import Image from 'next/image';
import { useStore } from '../store/useStore';

export default function MenuMobile () {
  const setMenuMobileModal = useStore((state) => state.setMenuMobileModal);

  return (
    <div className="w-full h-screen absolute top-0 left-0">
      <div className="w-full h-[81] bg-[#F5F2ED] p-8 text-lg font-semibold">
        <div>Меню</div>
        <button onClick={() => setMenuMobileModal(0)} className="absolute right-12 lg:right-15 top-8 lg:top-10">
          <Image
            src = "/closeIcon.png"
            alt = "Крест"
            width = {15}
            height = {17}
          />
        </button>
      </div>
      <div className="text-sm text-[#1F2D1A] font-medium flex flex-col py-5">
        <Link href="#howToOrder" className="p-5">Как заказать?</Link>
        <Link href="#hits" className="p-5">Хиты сезона</Link>
        <Link href="#showcase" className="p-5">Каталог</Link>
        <Link href="#actions" className="p-5">Акции</Link>
        <Link href="#about" className="p-5">О нас</Link>
        <Link href="#about" className="p-5">Контакты</Link>
      </div>
    </div>
  )
}