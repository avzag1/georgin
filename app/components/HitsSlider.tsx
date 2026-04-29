"use client"

import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Autoplay, Grid } from 'swiper/modules'; 
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import 'swiper/css/grid';
import 'swiper/swiper-bundle.css'; 
import "../slider.css";
import { Bouquet } from '../type/bouquet';
import BouquetCard from "./BouquetCard";

interface HitsSliderProps {
  array: Bouquet[];
  high: string;
  loop?: boolean;       // Необязательный проп, по умолчанию будет false
  rows?: number;       // Передаем количество рядов
}

export default function HitsSlider (
  { array, high, loop = false, rows = 1 }: HitsSliderProps
) {
  return (
    <div className="relative mx-auto w-full">
      <Swiper className="w-full"
        navigation={{
          nextEl: '.custom-next',
          prevEl: '.custom-prev',
        }}
        modules={[FreeMode, Navigation, Autoplay, Grid]}
        spaceBetween={0}
        freeMode={true}
        autoplay={{
          delay: 25000,
          disableOnInteraction: false,
        }}
        loop={loop}
        breakpoints={{
        0: {
          slidesPerView: 1,
          grid: { rows: 1, fill: 'row' },
        },
          860: {
            slidesPerView: 2,
            grid: { rows: rows > 1 ? 2 : 1, fill: 'row' },
          },
          1310: {
            slidesPerView: 3,
            grid: { rows: rows, fill: 'row' },
          },
        }}
        // navigation={true}
      >
        {/* Кнопки навигации */}
        <div className="custom-prev absolute left-0 lg:left-[-30] z-50 cursor-pointer text-black top-1/3 -translate-y-1/2 w-15 lg:w-24 h-15 lg:h-24 rounded-full lg:rounded-none bg-white/50 lg:bg-white/0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.3">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </div>
        <div className="custom-next absolute right-0 lg:right-[-30] z-50 cursor-pointer text-black top-1/3 -translate-y-1/2 w-15 lg:w-24 h-15 lg:h-24 rounded-full lg:rounded-none bg-white/50 lg:bg-white/0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.3">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
        {array.map((bouquet, index) => (
            <SwiperSlide
            key = {index}
            className={`${high} flex flex-row justify-center items-center box-border overflow-hidden`}>
              <BouquetCard {...bouquet}/>
            </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}