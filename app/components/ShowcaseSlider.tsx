"use client";

import HitsSlider from "./HitsSlider";
import { storeArray } from "../storeArray";
import { useStore } from "../store/useStore";
import Image from "next/image";
import { useState } from "react";

export default function ShowcaseSlider() {
  const [visible, setVisible] = useState(false);
  const toggle = useStore((state) => state.toggle);
  const setToggle = useStore((state) => state.setToggle);

  const toggleVisible = (): void => {
    setVisible(!visible);
  };

  const categories: Record<number, string> = {
    1: "designer",
    2: "mono",
    3: "wedding",
    4: "gifts",
  };
  const currentCategory = categories[toggle];
  if (!currentCategory) throw new Error("Ошибка кнопки выбора");

  const filteredArray = storeArray.filter(
    (item) => item.category === currentCategory,
  );
  const repeatedArray = Array(8).fill(filteredArray).flat();

  const getBtnClass = (id: number) =>
    `w-45 h-9 border border-[#2D531A] lg:border-[#9AB973] text-[#2D531A] text-left lg:text-center text-xs lg:text-base rounded-4xl lg:rounded-none justify-between lg:justify-center items-center px-3 lg:px-0 ${
      toggle === id
        ? "lg:bg-[#9AB973] flex"
        : visible === true
          ? "lg:bg-white/0"
          : "hidden lg:block"
    }`;

  return (
    <div>
      <div className="flex mx-3">
        <div className="flex justify-between lg:hidden ml-5 mr-0 lg:mx-12">
          <div className="mt-5">
            <Image
              className="mx-auto"
              src="/catalogTitle.png"
              alt="Каталог"
              width={192}
              height={51}
            />
          </div>
        </div>

        <div className="w-3/5 flex flex-col lg:flex-row justify-around mt-7 lg:mt-0 mb-2 mx-0 lg:mx-30 relative">
          <button
            onClick={() => {
              setToggle(1);
              setVisible(false);
            }}
            className={getBtnClass(1)}
          >
            <p>Авторские букеты</p>
          </button>
          <button
            onClick={toggleVisible}
            className="absolute right-4 top-2 block lg:hidden"
          >
            <Image
              className={visible ? "rotate-180" : "rotate-0"}
              src="/dropIcon.png"
              alt="Выпадающий список"
              width={24}
              height={26}
            />
          </button>

          <button
            onClick={() => {
              setToggle(2);
              setVisible(false);
            }}
            className={getBtnClass(2)}
          >
            <p className="ml-3 lg:ml-0">Моно букеты</p>
          </button>

          <button
            onClick={() => {
              setToggle(3);
              setVisible(false);
            }}
            className={getBtnClass(3)}
          >
            <p className="ml-3 lg:ml-0">Свадебные</p>
          </button>

          <button
            onClick={() => {
              setToggle(4);
              setVisible(false);
            }}
            className={getBtnClass(4)}
          >
            <p className="ml-3 lg:ml-0">Подарки</p>
          </button>
        </div>
      </div>
      <HitsSlider array={repeatedArray} high="h-1400" rows={2} loop={false} />
    </div>
  );
}
