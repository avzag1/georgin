"use client"

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Virtual, Autoplay, FreeMode } from "swiper/modules";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';
import Link from "next/link";
import {hitsSliderArray} from "../hitsSliderArray";
import Image from "next/image";
import OrderBouquet from "./OrderBouquet"

export default function HitsSlider () {
  function generateSlides() {
    return hitsSliderArray.map((item, index) => (
      <SwiperSlide
        key={index}
        className="h-[600px] flex justify-center items-center box-border overflow-hidden"
      >
        <Link
          href={item.path}
          className="w-[390px] max-w-full mx-auto flex flex-col justify-center box-border overflow-hidden"
        >
          <div className="flex justify-center items-top overflow-hidden h-[400px] max-h-[400px] max-w-[390px] box-border">
            <Image
              className="duration-500 md:hover:scale-105"
              src={item.image}
              width={390}
              height={400}
              alt="slide"
            />
          </div>
          <div className=" h-[200px] flex items-top pt-3 box-border">
            <div className="flex flex-col justify-between">
              <div className="text-2xl px-4">{item.title}</div>
              <div className="text-sm p-3">{item.description}</div>
              <div className="w-full flex justify-between">
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
    <div className="">
      <Swiper className=""
        modules={[FreeMode, Navigation, Autoplay]}
        spaceBetween={50}
        freeMode={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        loop={true}
        slidesPerView={3}
        breakpoints={{
          860: {
            slidesPerView: 2,
          },
          1310: {
            slidesPerView: 3,
          },
        }}
        navigation={true}
      >
        {generateSlides()}
      </Swiper>
    </div>
  );
}