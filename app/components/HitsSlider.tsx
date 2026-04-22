"use client"

import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Autoplay } from 'swiper/modules'; 
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import 'swiper/swiper-bundle.css'; 
import "../slider.css";
import Link from "next/link";
import {hitsSliderArray} from "../hitsSliderArray";
import Image from "next/image";
import OrderBouquet from "./OrderBouquetButton"

export default function HitsSlider () {
  function generateSlides() {
    return [...hitsSliderArray, ...hitsSliderArray].map((item, index) => (
      <SwiperSlide
        key={index}
        className="h-[600] flex justify-center items-center box-border overflow-hidden"
      >
        <Link
          href={item.path}
          className="w-[390] max-w-full mx-auto flex flex-col justify-center box-border overflow-hidden"
        >
          <div className="flex justify-center items-top overflow-hidden h-[400] max-h-[400] max-w-[390] box-border">
            <Image
              className="duration-500 md:hover:scale-105"
              src={item.image}
              width={390}
              height={400}
              alt="slide"
            />
          </div>
          <div className="h-[200] flex items-top pt-3 box-border">
            <div className="flex flex-col justify-between w-[390]">
              <div className="text-2xl px-4">{item.title}</div>
              <div className="text-sm p-3">{item.description}</div>
              <div className="w-full flex justify-between items-center">
                <div className="text-lg px-3">от {item.price} &#8381;</div>
                <div><OrderBouquet bgColor="bg-[#7E8F52]"/></div>
              </div>
              
            </div>
          </div>
        </Link>
      </SwiperSlide>
    ));
  }

  return (
    <div className="mx-auto w-full">
      <Swiper className="w-full"
        navigation={{
          nextEl: '.custom-next',
          prevEl: '.custom-prev',
        }}
        modules={[FreeMode, Navigation, Autoplay]}
        spaceBetween={0}
        freeMode={true}
        autoplay={{
          delay: 25000,
          disableOnInteraction: false,
        }}
        loop={true}
        slidesPerView={1}
        breakpoints={{
          860: {
            slidesPerView: 2,
          },
          1310: {
            slidesPerView: 3,
          },
        }}
        // navigation={true}
      >
        {/* Кнопки навигации */}
        <div className="custom-prev absolute left-[-30] z-10 cursor-pointer text-black top-1/3 -translate-y-1/2 w-24 h-24">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.3">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </div>
        <div className="custom-next absolute right-[-30] z-10 cursor-pointer text-black top-1/3 -translate-y-1/2 w-24 h-24">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.3">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
        {generateSlides()}
      </Swiper>
    </div>
  );
}