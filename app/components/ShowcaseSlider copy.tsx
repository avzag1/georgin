"use client"

import HitsSlider from "./HitsSlider";
import {hitsSliderArray} from "../hitsSliderArray";
import { useState } from "react";
import { Bouquet } from "../type/bouquet";

export default function ShowcaseSlider () {
  let array: Bouquet[];
  const [toggle, setToggle] = useState(1);
  function updateToggle(id: number) {
    setToggle(id);
  }

  switch (toggle) {
    case 1:
      array = hitsSliderArray.filter(item => item.category === "designer")
      break;
    case 2:
      array = hitsSliderArray.filter(item => item.category === "mono")
      break;
    case 3:
      array = hitsSliderArray.filter(item => item.category === "wedding")
      break;
    case 4:
      array = hitsSliderArray.filter(item => item.category === "gifts")
      break;
    default: throw new Error("Ошибка кнопки выбора")
  }

  array = [...array, ...array, ...array, ...array, ...array, ...array, ...array, ...array]

  return (
    <div>
      <div className="w-3/5 flex flex-row justify-around mb-10 mx-30">
          <button
          onClick={()=>updateToggle(1)}
          className={
            toggle === 1 ? "w-45 h-9 text-base border border-[#9AB973] text-[#2D531A] bg-[#9AB973]" : "w-45 h-9 text-base border border-[#9AB973] text-[#2D531A]"
          }
          >
          Авторские букеты
        </button>        

        <button
          onClick={()=>updateToggle(2)}
          className={
            toggle === 2 ? "w-45 h-9 text-base border border-[#9AB973] text-[#2D531A] bg-[#9AB973]" : "w-45 h-9 text-base border border-[#9AB973] text-[#2D531A]"
          }
        >
          Моно букеты
        </button>

        <button
          onClick={()=>updateToggle(3)}
          className={
            toggle === 3 ? "w-45 h-9 text-base border border-[#9AB973] text-[#2D531A] bg-[#9AB973]" : "w-45 h-9 text-base border border-[#9AB973] text-[#2D531A]"
          }
        >
          Свадебные
        </button>

        <button
          onClick={()=>updateToggle(4)}
          className={
            toggle === 4 ? "w-45 h-9 text-base border border-[#9AB973] text-[#2D531A] bg-[#9AB973]" : "w-45 h-9 text-base border border-[#9AB973] text-[#2D531A]"
          }
        >
          Подарки
        </button>
      </div>
      <HitsSlider array={[...array, ...array,...array,...array]} high="h-1400" rows={2} loop={false}/>
    </div>
  )
}