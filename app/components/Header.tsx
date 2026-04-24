"use client"

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button, Checkbox, Label, Modal, ModalBody, ModalHeader, TextInput } from "flowbite-react";

export default function Header () {
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openShoppingCardModal, setOpenShoppingCardModal] = useState(false);

  function onCloseProfileModal() {
    setOpenProfileModal(false);
  }

  function onCloseShoppingCardModal() {
    setOpenShoppingCardModal(false);
  }

  return (
    <header className="w-full h-20 flex items-center justify-between">
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
                <div className="p-5">КАК ЗАКАЗАТЬ?</div>
                <div className="p-5">ХИТЫ СЕЗОНА</div>
                <div className="p-5">ОНЛАЙН-ВИТРИНА</div>
                <div className="p-5">АКЦИИ</div>
                <div className="p-5">О нас</div>
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
                <div className="rounded-full p-1">
                  <Image
                    src = "/shoppingСart.png"
                    alt = "Корзина"
                    width = {44}
                    height = {44}
                  />
                </div>
                <div className="rounded-full p-1">
                  <Image
                    src = "/profile.png"
                    alt = "Профиль"
                    width = {44}
                    height = {44}
                  />
                </div>
              </div>
            </div>
            <div className="hidden">
              <Profile/>
            </div>
          </header>
  )
}