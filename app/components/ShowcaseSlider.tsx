"use client"

import HitsSlider from "./HitsSlider";
import {hitsSliderArray} from "../hitsSliderArray";
import { useStore } from '../store/useStore';

export default function ShowcaseSlider () {
  const toggle = useStore((state) => state.toggle);
  const setToggle = useStore((state) => state.setToggle);
  const categories: Record<number, string> = {
    1: "designer",
    2: "mono",
    3: "wedding",
    4: "gifts"
  };
  const currentCategory = categories[toggle];
  if (!currentCategory) throw new Error("Ошибка кнопки выбора");

  const filteredArray = hitsSliderArray.filter(item => item.category === currentCategory);
  const repeatedArray = Array(8).fill(filteredArray).flat();

  const getBtnClass = (id: number) => 
    `w-45 h-9 text-base border border-[#9AB973] text-[#2D531A] ${
      toggle === id ? "bg-[#9AB973]" : ""
    }`;

  return (
    <div>
      <div className="w-3/5 flex flex-row justify-around mb-10 mx-30">
          <button
          onClick={() => setToggle(1)} className={getBtnClass(1)}
          >
          Авторские букеты
        </button>        

        <button
          onClick={() => setToggle(2)} className={getBtnClass(2)}
        >
          Моно букеты
        </button>

        <button
          onClick={() => setToggle(3)} className={getBtnClass(3)}
        >
          Свадебные
        </button>

        <button
          onClick={() => setToggle(4)} className={getBtnClass(4)}
        >
          Подарки
        </button>
      </div>
      <HitsSlider array={repeatedArray} high="h-1400" rows={2} loop={false}/>
    </div>
  )
}