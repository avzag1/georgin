"use client"

import Link from "next/link"
import Image from "next/image";
import { useStore } from '../store/useStore';
import Support from "../components/Support";
import SubscribeForm from "../components/SubscribeForm";

export default function Footer () {
  const setToggle = useStore((state) => state.setToggle);
  const setSupportModal = useStore((state) => state.setSupportModal);

  return (
     <footer className="w-full lg:w-[1440] h-auto lg:h-[374] mx-auto bg-[#F5F2ED] flex flex-col justify-between px-5 pb-10 lg:p-10 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row justify-around order-2 lg:order-1">
        <div className="h-auto lg:h-[140] flex flex-col text-[#394128] text-sm pl-7 lg:p-l0">
          <div className="font-semibold text-black">О нас</div>
          <div className="py-2 lg:p-2">Контакты</div>
          <div className="py-2 lg:p-2">Отзывы</div>
          <button onClick={() => setSupportModal(1)} className="p-2 text-left lg:text-center">Поддержка</button>
        </div>

        <div className="h-auto lg:h-[140] flex flex-col justify-between text-[#394128] text-sm pl-7 lg:p-l0 pb-2">
          <div className="font-semibold text-black">Покупателям</div>
          <Link href="#howToOrder" className="p-2">Как заказать</Link>
          <Link href="#actions" className="p-2">Акции</Link>
          <div className="p-2">Доставка</div>
        </div>

        <div className="h-auto lg:h-[140] flex flex-col justify-between text-[#394128] text-sm pl-7 lg:p-l0 pb-2">
          <div className="font-semibold text-black">Каталог</div>
          <Link href="#hits" className="p-2">Хиты сезона</Link>
          <button onClick={() => {
              setToggle(1);
              document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="p-2 text-left">
              Авторские букеты
          </button>
          <button onClick={() => {
              setToggle(2);
              document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-2 text-left">
              Моно букеты
          </button>
          <button onClick={() => {
              setToggle(3);
              document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-2 text-left">
              Свадебные
          </button>
          <button onClick={() => {
              setToggle(4);
              document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-2 text-left">
              Подарки
          </button>
        </div>

        <div className="flex flex-col">
          <div className="h-auto lg:h-[140] flex flex-col justify-between text-[#394128] text-sm pl-7 lg:p-l0 pb-2">
            <div className="font-semibold text-black">Контакты</div>
            <div className="">+7 (937) 938-87-77</div>
            <div>г. Йошкар-Ола</div>
            <div>Я. Крастыня 2В, Мира 113А,</div>
            <div>Красноармейская улица 103 к1</div>
          </div>

          <div className="mt-7 h-auto lg:h-[50] flex flex-col justify-between text-[#394128] text-sm pl-7 lg:p-l0 border-b pb-2">
            <div className="font-semibold text-black">Режим работы</div>
            <div className="">ПН-ВС, с 9:00 до 20:00</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <Image
            className="ml-5"
            src = "/logoFooter.png"
            alt = "Логотип"
            width = {219}
            height = {72}
          />
          
          <div className="flex justify-center mt-3">
            <a href="https://t.me/georgin1226" target="blank">
              <Image
                className="m-2"
                src = "/telegramIcon.png"
                alt = "Телеграм"
                width = {25}
                height = {26}
              />
            </a>
            <a href="https://www.instagram.com/georg.in12?igsh=ZGlybnhvd3BnMDFq&utm_source=qr" target="blank">
              <Image
                className="m-2"
                src = "/instagramIcon.png"
                alt = "Инстаграм"
                width = {26}
                height = {25}
              />
            </a>
            <a href="https://vk.com/georgin_yo" target="blank">
              <Image
                className="m-2"
                src = "/VKIcon.png"
                alt = "Вконтакте"
                width = {25}
                height = {25}
              />
            </a>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-7 w-full order-1 lg:order-2 mx-auto lg:mx-0">
        <div className="hidden lg:flex items-end ml-15 text-xs">&copy; 2026 Copiright</div>
        <div className="flex flex-col w-[620] max-w-screen">
          <div className="font-medium text-center lg:text-left text-xs lg:text-base mb-3 lg:mb-0">Узнайте первыми о самых выгодных акциях и предложениях</div>
          <SubscribeForm/>
        </div>
      </div>

      <Support/>
    </footer>
  )
}