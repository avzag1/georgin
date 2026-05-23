"use client";

import Link from "next/link";
import Image from "next/image";
import { useStore } from "../store/useStore";
import Profile from "./Profile"; // Проверьте правильность вашего пути
import { useEffect } from "react";

export default function MenuMobile() {
  const menuMobileModal = useStore((state) => state.menuMobileModal);
  const setMenuMobileModal = useStore((state) => state.setMenuMobileModal);

  // ✅ БЛОКИРОВКА СКРОЛЛА ПРИ ОТКРЫТОМ МЕНЮ
  useEffect(() => {
    if (menuMobileModal === 1) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuMobileModal]);

  // ✅ ИСПРАВЛЕНИЕ: Изменили на fixed z-90, чтобы меню не уезжало вверх при прокрутке экрана
  const getMenuMobileModalClass = () =>
    `${
      menuMobileModal === 1
        ? "w-full h-screen fixed top-0 left-0 bg-white z-90 overflow-y-auto animate-in slide-in-from-top duration-200"
        : "hidden"
    }`;

  return (
    <div className={getMenuMobileModalClass()}>
      {/* ✅ ИСПРАВЛЕНИЕ: Добавили px к h-[81px] */}
      <div className="w-full flex h-[81] bg-[#F5F2ED] p-8 text-lg font-semibold items-center relative border-b">
        {/* Кнопка Профиля внутри меню */}
        <div className="scale-80 -mt-5 mr-5">
          <Profile />
        </div>
        <div>Меню</div>

        <button
          type="button"
          onClick={() => setMenuMobileModal(0)}
          className="absolute right-8 top-1/2 -translate-y-1/2 cursor-pointer p-1 hover:opacity-75"
        >
          <Image src="/closeIcon.png" alt="Крест" width={15} height={17} />
        </button>
      </div>

      {/* Ссылки навигации меню */}
      <div
        onClick={() => setMenuMobileModal(0)}
        className="text-xl text-white text-center font-medium flex flex-col w-full"
      >
        <Link
          href="#howToOrder"
          className="bg-[#7E8F52] p-5 border-b border-[#6b7a44] hover:bg-[#6b7a44] transition-colors"
        >
          Как заказать?
        </Link>
        <Link
          href="#hits"
          className="bg-[#a9b983] p-5 border-b border-[#92a36b] hover:bg-[#92a36b] transition-colors"
        >
          Хиты сезона
        </Link>
        <Link
          href="#showcase"
          className="bg-[#7E8F52] p-5 border-b border-[#6b7a44] hover:bg-[#6b7a44] transition-colors"
        >
          Каталог
        </Link>
        <Link
          href="#actions"
          className="bg-[#a9b983] p-5 border-b border-[#92a36b] hover:bg-[#92a36b] transition-colors"
        >
          Акции
        </Link>
        <Link
          href="#about"
          className="bg-[#7E8F52] p-5 border-b border-[#6b7a44] hover:bg-[#6b7a44] transition-colors"
        >
          О нас
        </Link>
        <Link
          href=""
          className="bg-[#a9b983] p-5 hover:bg-[#92a36b] transition-colors"
        >
          Контакты
        </Link>
      </div>
    </div>
  );
}

// "use client"

// import Link from "next/link";
// import Image from 'next/image';
// import { useStore } from '../store/useStore';
// import Profile from "../components/Profile";

// export default function MenuMobile () {
//   const menuMobileModal = useStore((state) => state.menuMobileModal);
//   const setMenuMobileModal = useStore((state) => state.setMenuMobileModal);

//   const getMenuMobileModalClass = () =>
//     `${menuMobileModal === 1 ?
//       "w-full h-screen absolute top-0 left-0"
//       : "hidden"}`;

//   return (
//     <div className={getMenuMobileModalClass()}>
//       <div className="w-full flex h-[81] bg-[#F5F2ED] p-8 text-lg font-semibold">
//         <div className="scale-80 -mt-7 mr-5"><Profile /></div>
//         <div>Меню</div>
//         <button onClick={() => setMenuMobileModal(0)} className="absolute right-12 lg:right-15 top-8 lg:top-10">
//           <Image
//             src = "/closeIcon.png"
//             alt = "Крест"
//             width = {15}
//             height = {17}
//           />
//         </button>
//       </div>
//       <div onClick={()=>setMenuMobileModal(0)} className="text-xl text-white text-center font-medium flex flex-col">
//           <Link href="#howToOrder" className="bg-[#7E8F52] p-5">Как заказать?</Link>
//           <Link href="#hits" className="bg-[#a9b983] p-5">Хиты сезона</Link>
//           <Link href="#showcase" className="bg-[#7E8F52] p-5">Каталог</Link>
//           <Link href="#actions" className="bg-[#a9b983] p-5">Акции</Link>
//           <Link href="#about" className="bg-[#7E8F52] p-5">О нас</Link>
//           <Link href="" className="bg-[#a9b983] p-5">Контакты</Link>
//       </div>
//     </div>
//   )
// }
