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
    <header className="hidden sm:flex w-full h-20 items-center justify-between relative z-40">
      <div className="mx-5 xl:mx-20 flex items-center min-w-[106] max-w-[150]">
        <Image
          src = "/logo.png"
          alt = "Логотип"
          width = {106}
          height = {33}
        />
      </div>

      <div className="flex flex-row justify-center items-center mr-0 sm:mr-10">
        <div className="text-[10px] lg:text-sm text-[#1F2D1A] font-medium flex flex-row justify-between mx-5">
          <Link href="#howToOrder" className="p-1 lg:p-5 text-center">КАК ЗАКАЗАТЬ?</Link>
          <Link href="#hits" className="p-1 lg:p-5 text-center">ХИТЫ СЕЗОНА</Link>
          <Link href="#showcase" className="p-1 lg:p-5 text-center">ОНЛАЙН-ВИТРИНА</Link>
          <Link href="#actions" className="flex items-center p-1 lg:p-5 text-center">АКЦИИ</Link>
          <Link href="#about" className="flex items-center p-1 lg:p-5 text-center lg:min-w-[80]">О нас</Link>
        </div>

        <div className="flex flex-row gap-1 justify-between items-center">
          <Link target="blank" href="tel:+79379388777" className="flex justify-center items-center rounded-4xl p-1 mr-2 w-[80] lg:w-[149] h-[41] bg-[#7E8F52] text-white text-sm 
          transition-colors duration-200 hover:bg-[#616e40]
           active:bg-[#d7e6b2] active:text-[#242918]">
            <p className="text-xs lg:text-base">Позвонить</p>
          </Link>
          <button onClick={() => setShoppingCardModal(1)} className="flex justify-center items-center rounded-full p-1 cursor-pointer w-[44] h-[44] bg-[#7E8F52]
          text-white text-sm 
          transition-colors duration-200 hover:bg-[#616e40]
           active:bg-[#d7e6b2] active:text-[#242918]">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.6 17.6C18.1835 17.6 18.7431 17.8318 19.1556 18.2444C19.5682 18.6569 19.8 19.2165 19.8 19.8C19.8 20.3835 19.5682 20.9431 19.1556 21.3556C18.7431 21.7682 18.1835 22 17.6 22C17.0165 22 16.4569 21.7682 16.0444 21.3556C15.6318 20.9431 15.4 20.3835 15.4 19.8C15.4 18.579 16.379 17.6 17.6 17.6ZM0 0H3.597L4.631 2.2H20.9C21.1917 2.2 21.4715 2.31589 21.6778 2.52218C21.8841 2.72847 22 3.00826 22 3.3C22 3.487 21.945 3.674 21.868 3.85L17.93 10.967C17.556 11.638 16.83 12.1 16.005 12.1H7.81L6.82 13.893L6.787 14.025C6.787 14.0979 6.81597 14.1679 6.86755 14.2195C6.91912 14.271 6.98907 14.3 7.062 14.3H19.8V16.5H6.6C6.01652 16.5 5.45694 16.2682 5.04436 15.8556C4.63178 15.4431 4.4 14.8835 4.4 14.3C4.4 13.915 4.499 13.552 4.664 13.244L6.16 10.549L2.2 2.2H0V0ZM6.6 17.6C7.18348 17.6 7.74305 17.8318 8.15563 18.2444C8.56821 18.6569 8.8 19.2165 8.8 19.8C8.8 20.3835 8.56821 20.9431 8.15563 21.3556C7.74305 21.7682 7.18348 22 6.6 22C6.01652 22 5.45694 21.7682 5.04436 21.3556C4.63178 20.9431 4.4 20.3835 4.4 19.8C4.4 18.579 5.379 17.6 6.6 17.6ZM16.5 9.9L19.558 4.4H5.654L8.25 9.9H16.5Z" fill="currentColor"/>
            </svg>
          </button>
          <button onClick={() => setProfileModal(1)} className="flex justify-center items-center rounded-full p-1 cursor-pointer w-[44] h-[44] bg-[#7E8F52]
          text-white text-sm 
          transition-colors duration-200 hover:bg-[#616e40]
           active:bg-[#d7e6b2] active:text-[#242918]">
            <svg width="16" height="23" viewBox="0 0 16 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.97979 8.75499C10.1213 8.75499 11.8573 7.01898 11.8573 4.8775C11.8573 2.73601 10.1213 1 7.97979 1C5.83831 1 4.10229 2.73601 4.10229 4.8775C4.10229 7.01898 5.83831 8.75499 7.97979 8.75499Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M14.9592 17.2567C14.9592 19.8262 14.9592 21.9097 7.97974 21.9097C1.00024 21.9097 1.00024 19.8262 1.00024 17.2567C1.00024 14.6872 4.12531 12.6037 7.97974 12.6037C11.8342 12.6037 14.9592 14.6872 14.9592 17.2567Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {/* <Image
              src = "/profile.png"
              alt = "Профиль"
              width = {15}
              height = {15}
            /> */}
          </button>
        </div>
      </div>
      <Profile/>
      <ShoppingCard/>
    </header>
  )
}