"use client"

import Image from "next/image";
import Link from "next/link";
import Profile from "../components/Profile";
import { useStore } from '../store/useStore';
import ShoppingCard from "../components/ShoppingCard";

export default function Header () {
  const setProfileModal = useStore((state) => state.setProfileModal);
  const setShoppingCardModal = useStore((state) => state.setShoppingCardModal);

  return (
    <header className="hidden lg:flex w-full h-20 items-center justify-between relative z-40">
      <div className="mx-20 flex items-center">
        <Image
          src = "/logo.png"
          alt = "Логотип"
          width = {105}
          height = {32}
        />
      </div>

      <div className="flex flex-row justify-center items-center mx-10">
        <div className="text-sm text-[#1F2D1A] font-medium flex flex-row justify-between mx-5">
          <Link href="#howToOrder" className="p-5">КАК ЗАКАЗАТЬ?</Link>
          <Link href="#hits" className="p-5">ХИТЫ СЕЗОНА</Link>
          <Link href="#showcase" className="p-5">ОНЛАЙН-ВИТРИНА</Link>
          <Link href="#actions" className="p-5">АКЦИИ</Link>
          <Link href="#about" className="p-5">О нас</Link>
        </div>

        <div className="flex flex-row justify-between items-center">
          <Link target="blank" href="tel:+79379388777" className="rounded-2xl p-1">
            <Image
              src = "/callButton.png"
              alt = "Кнопка Позвонить"
              width = {149}
              height = {41}
            />
          </Link>
          <button onClick={() => setShoppingCardModal(1)} className="rounded-full p-1">
            <Image
              src = "/shoppingСart.png"
              alt = "Корзина"
              width = {44}
              height = {44}
            />
          </button>
          <button onClick={() => setProfileModal(1)} className="rounded-full p-1">
            <Image
              src = "/profile.png"
              alt = "Профиль"
              width = {44}
              height = {44}
            />
          </button>
        </div>
      </div>
      <Profile/>
      <ShoppingCard/>
    </header>
  )
}