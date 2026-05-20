import Image from "next/image";
import { Bouquet } from "../type/bouquet";
import OrderBouquetButton from "./OrderBouquetButton";

// Мы принимаем объект bouquet напрямую из параметров, 
// как этого ожидает ваш слайдер HitsSlider
export default function BouquetCard(bouquet: Bouquet) {
  // Защита: проверяем, что объект пришел. Если данных нет, возвращаем пустой блок
  if (!bouquet || !bouquet.title) return null;

  return (
    <div className="min-[260px]:max-[320px]:w-[240] w-[300] max-w-full mx-auto my-5 flex flex-col justify-center box-border overflow-hidden">
      <div className="flex justify-center items-top overflow-hidden min-[260px]:max-[320px]:h-auto h-[300] max-h-[300] max-w-[390] box-border">
        <Image
          className="duration-500 md:hover:scale-105"
          src={bouquet.image || '/placeholder.png'}
          width={390}
          height={400}
          alt="slide"
        />
      </div>
      <div className="h-auto flex items-top pt-3 box-border">
        <div className="flex flex-col justify-between w-[390]">
          <div className="text-2xl px-4">{bouquet.title}</div>
          <div className="text-sm p-3">{bouquet.description}</div>
          <div className="w-full flex justify-between items-center">
            <div className="text-lg px-3">от {bouquet.price} ₽</div>
            <div>
              {/* Передаем объект bouquet дальше в кнопку заказа */}
              <OrderBouquetButton bouquet={bouquet} bgColor="bg-[#7E8F52]"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}