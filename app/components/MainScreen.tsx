"use client"

import { useStore } from '../store/useStore';
import ShoppingCard from "../components/ShoppingCard";
import MenuMobile from "../components/MenuMobile";
import OrderButtonActive from "../components/OrderButtonActive";
import Image from 'next/image';

export default function MainScreen () {
  const setShoppingCardModal = useStore((state) => state.setShoppingCardModal);
  const setMenuMobileModal = useStore((state) => state.setMenuMobileModal);

  return (
    <section className="w-full relative">
      <div className="flex items-center justify-center h-5 text-xs sm:text-sm text-white bg-[#0F330F]">
        <p>БЕСПЛАТНАЯ ДОСТАВКА ПО ГОРОДУ ОТ 3000 рублей</p>
      </div>
      
      <div className="hidden sm:block w-full h-auto overflow-hidden">
        <Image
          className="w-full h-auto mt-[-14]"
          src = "/mainDesktop.png"
          alt = "Главное изображение"
          width = {1440}
          height = {936}
        />
      </div>
      <div className="block sm:hidden w-full h-auto overflow-hidden">
        <Image
          className="w-full h-auto mt-[-1]"
          src = "/mainDesktopMobile.png"
          alt = "Главное изображение"
          width = {399}
          height = {660}
        />
      </div>

      <div className="flex justify-between w-[100] sm:hidden absolute top-10 right-3">
        <button onClick={() => setShoppingCardModal(1)}>
          <Image
            className=""
            src = "/shoppingCardMobile.png"
            alt = "Корзина"
            width = {46}
            height = {46}
          />
        </button>
        <button onClick={() => setMenuMobileModal(1)}>
          <Image
            className=""
            src = "/menuMobile.png"
            alt = "Меню"
            width = {46}
            height = {46}
          />
        </button>
      </div>

      <div className="absolute bottom-[15%] w-19/20 mx-auto sm:mx-0 sm:w-[505] inset-x-0 sm:left-[15%] flex flex-col items-center">
        <div className="hidden sm:block mb-20">
          <OrderButtonActive bgColor="bg-[#ABC270]" textColor="text-black"/>
        </div>
        <div className="text-white flex flex-col items-center text-center">
          <div className="text-sm sm:text-lg">Доставка по Йошкар-Оле, Медведево и Семеновке</div>
          <div className="text-xs sm:text-base">Возможна доставка за пределы города - уточняйте по телефону</div>
        </div>
      </div>
      <ShoppingCard/>
      <MenuMobile/>
    </section>
  )
}