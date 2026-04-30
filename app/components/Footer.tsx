"use client";

import Link from "next/link";
import Image from "next/image";
import { useStore } from "../store/useStore";
import Support from "../components/Support";
import SubscribeForm from "../components/SubscribeForm";
import { useState } from "react";

interface DropItems {
  about: string,
  clients: string,
  catalog: string,
  contacts: string,
  schedule: string,
  closed: string
}

export default function Footer() {
  const setToggle = useStore((state) => state.setToggle);
  const setSupportModal = useStore((state) => state.setSupportModal);
  const [drop, setDrop] = useState<keyof DropItems>('closed');

  const toggleDrop = (id: keyof DropItems): void => {
    if (drop === id) {
      setDrop('closed')
    } else {
      setDrop(id)
    }
  }

  return (
    <footer className="w-full lg:w-[1440] h-auto lg:h-[374] mx-auto bg-[#F5F2ED] flex flex-col justify-between px-5 pb-10 lg:p-10 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row justify-around order-2 lg:order-1">
        <div className="h-auto lg:h-[140] flex flex-col text-[#394128] text-sm pl-7 lg:p-l0 border-b border-b-gray-400 lg:border-none">
          <div className="py-2 pr-2 font-normal lg:font-semibold text-black flex justify-between">
            <div>О нас</div>
            <button onClick={()=>toggleDrop('about')} className={`flex justify-center items-center lg:hidden transition-transform ${drop === 'about' ? "rotate-180" : "rotate-0"}`}>
              <Image
                className=""
                src="/dropIconFooter.png"
                alt="Развернуть"
                width={14}
                height={16}
              />
            </button>
          </div>
          <div className={drop === 'about' ? "flex flex-col" : "hidden lg:flex lg:flex-col"}>
            <div className="py-2">Контакты</div>
            <div className="py-2">Отзывы</div>
            <button
              onClick={() => setSupportModal(1)}
              className="py-2 text-left lg:text-center"
            >
              Поддержка
            </button>
          </div>
        </div>

        <div className="h-auto lg:h-[140] flex flex-col justify-between text-[#394128] text-sm pl-7 lg:p-l0 pb-2 border-b border-b-gray-400 lg:border-none">
          <div className="py-2 font-normal lg:font-semibold text-black flex justify-between pr-2">
            <div>Покупателям</div>
            <button onClick={()=>toggleDrop('clients')} className={`flex justify-center items-center lg:hidden transition-transform ${drop === 'clients' ? "rotate-180" : "rotate-0"}`}>
              <Image
                className=""
                src="/dropIconFooter.png"
                alt="Развернуть"
                width={14}
                height={16}
              />
            </button>
          </div>
          <div className={drop === 'clients' ? "flex flex-col" : "hidden lg:flex lg:flex-col"}>
            <Link href="#howToOrder" className="py-2">
              Как заказать
            </Link>
            <Link href="#actions" className="py-2">
              Акции
            </Link>
            <div className="py-2">Доставка</div>
          </div>
        </div>

        <div className="h-auto lg:h-[140] flex flex-col justify-between text-[#394128] text-sm pl-7 lg:p-l0 pb-2 border-b border-b-gray-400 lg:border-none">
          <div className="py-2 pr-2 font-normal lg:font-semibold text-black flex justify-between">
            <div>Каталог</div>
            <button onClick={()=>toggleDrop('catalog')} className={`flex justify-center items-center lg:hidden transition-transform ${drop === 'catalog' ? "rotate-180" : "rotate-0"}`}>
              <Image
                className=""
                src="/dropIconFooter.png"
                alt="Развернуть"
                width={14}
                height={16}
              />
            </button>
          </div>
          <div className={drop === 'catalog' ? "flex flex-col" : "hidden lg:flex lg:flex-col"}>
            <Link href="#hits" className="py-2">
              Хиты сезона
            </Link>
            <button
              onClick={() => {
                setToggle(1);
                document
                  .getElementById("showcase")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="py-2 text-left"
            >
              Авторские букеты
            </button>
            <button
              onClick={() => {
                setToggle(2);
                document
                  .getElementById("showcase")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="py-2 text-left"
            >
              Моно букеты
            </button>
            <button
              onClick={() => {
                setToggle(3);
                document
                  .getElementById("showcase")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="py-2 text-left"
            >
              Свадебные
            </button>
            <button
              onClick={() => {
                setToggle(4);
                document
                  .getElementById("showcase")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="py-2 text-left"
            >
              Подарки
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="h-auto lg:h-[140] flex flex-col justify-between text-[#394128] text-sm pl-7 lg:p-l0 pb-2 border-b border-b-gray-400 lg:border-none">
            <div className="py-2 pr-2 font-normal lg:font-semibold text-black flex justify-between">
              <div>Контакты</div>
              <button onClick={()=>toggleDrop('contacts')} className={`flex justify-center items-center lg:hidden transition-transform ${drop === 'contacts' ? "rotate-180" : "rotate-0"}`}>
                <Image
                  className=""
                  src="/dropIconFooter.png"
                  alt="Развернуть"
                  width={14}
                  height={16}
                />
              </button>
            </div>
            <div className={drop === 'contacts' ? "flex flex-col" : "hidden lg:flex lg:flex-col"}>
              <div className="py-2 lg:py-1">+7 (937) 938-87-77</div>
              <div className="py-2 lg:py-1">г. Йошкар-Ола</div>
              <div className="py-2 lg:py-1">Я. Крастыня 2В, Мира 113А,</div>
              <div className="py-2 lg:py-1">Красноармейская улица 103 к1</div>
            </div>
          </div>

          <div className="mt-0 lg:mt-4 mb-2 h-auto lg:h-[50] flex flex-col justify-between text-[#394128] text-sm pl-7 lg:p-l0 border-b border-b-gray-400 lg:border-none">
            <div className="py-2 pr-2 font-normal lg:font-semibold text-black flex justify-between">
              <div>Режим работы</div>
              <button onClick={()=>toggleDrop('schedule')} className={`flex justify-center items-center lg:hidden transition-transform ${drop === 'schedule' ? "rotate-180" : "rotate-0"}`}>
                <Image
                  className=""
                  src="/dropIconFooter.png"
                  alt="Развернуть"
                  width={14}
                  height={16}
                />
              </button>
            </div>
            <div className={drop === 'schedule' ? "py-2" : "hidden lg:flex lg:flex-col"}>ПН-ВС, с 9:00 до 21:00</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <Image
            className="ml-5 order-2 lg:order-1"
            src="/logoFooter.png"
            alt="Логотип"
            width={219}
            height={72}
          />

          <div className="flex justify-center w-full mt-5 lg:mt-3 mb-7 lg:mb-0 order-1 lg:order-2 border-b lg:border-none">
            <a href="https://t.me/georgin1226" target="blank">
              <Image
                className="m-2"
                src="/telegramIcon.png"
                alt="Телеграм"
                width={25}
                height={26}
              />
            </a>
            <a
              href="https://www.instagram.com/georg.in12?igsh=ZGlybnhvd3BnMDFq&utm_source=qr"
              target="blank"
            >
              <Image
                className="m-2"
                src="/instagramIcon.png"
                alt="Инстаграм"
                width={26}
                height={25}
              />
            </a>
            <a href="https://vk.com/georgin_yo" target="blank">
              <Image
                className="m-2"
                src="/VKIcon.png"
                alt="Вконтакте"
                width={25}
                height={25}
              />
            </a>
          </div>
        </div>
      </div>

      <div className="mb-5 lg:mb-0 flex justify-between mt-7 w-full order-1 lg:order-2 mx-auto lg:mx-0">
        <div className="hidden lg:flex items-end ml-15 text-xs">
          &copy; 2026 Copiright
        </div>
        <div className="flex flex-col w-[620] max-w-screen">
          <div className="font-medium text-center lg:text-left text-xs lg:text-base mb-3 lg:mb-0">
            Узнайте первыми о самых выгодных акциях и предложениях
          </div>
          <SubscribeForm />
        </div>
      </div>

      <Support />
    </footer>
  );
}
