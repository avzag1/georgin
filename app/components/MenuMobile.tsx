"use client"

import Link from "next/link";
import Image from 'next/image';
import { useStore } from '../store/useStore';

export default function MenuMobile () {
  const menuMobileModal = useStore((state) => state.menuMobileModal);
  const setMenuMobileModal = useStore((state) => state.setMenuMobileModal);

  const getMenuMobileModalClass = () => 
    `${menuMobileModal === 1 ? 
      "w-full h-screen absolute top-0 left-0" 
      : "hidden"}`;

  return (
    <div className={getMenuMobileModalClass()}>
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
      <div onClick={()=>setMenuMobileModal(0)} className="text-xl text-white text-center font-medium flex flex-col">
          <Link href="#howToOrder" className="bg-[#7E8F52] p-5">Как заказать?</Link>
          <Link href="#hits" className="bg-[#a9b983] p-5">Хиты сезона</Link>
          <Link href="#showcase" className="bg-[#7E8F52] p-5">Каталог</Link>
          <Link href="#actions" className="bg-[#a9b983] p-5">Акции</Link>
          <Link href="#about" className="bg-[#7E8F52] p-5">О нас</Link>
          <Link href="" className="bg-[#a9b983] p-5">Контакты</Link>
      </div>
    </div>
  )
}