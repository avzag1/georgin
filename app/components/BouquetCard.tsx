import Image from "next/image";
import { Bouquet } from "../type/bouquet";
import OrderBouquetButton from "./OrderBouquetButton";

// Мы принимаем объект bouquet напрямую из параметров, 
// как этого ожидает ваш слайдер HitsSlider
// export default function BouquetCard(bouquet: Bouquet) {
//   // Константы для нормализации путей картинок в Docker / S3
  const S3_HOST = process.env.S3_URL || "https://s3.twcstorage.ru";
  const BUCKET_NAME = process.env.S3_BUCKET_NAME || "022c62a9-5b17-4928-aca6-4d54213d95b6";

//   // Защита: проверяем, что объект пришел. Если данных нет, возвращаем пустой блок
//   if (!bouquet || !bouquet.title) return null;

//   return (
//     <div className="min-[260px]:max-[320px]:w-[240] w-[300] max-w-full mx-auto my-5 flex flex-col justify-center box-border overflow-hidden">
//       {/* Яркий бейдж "ХИТ" в углу карточки */}
//       {/* {bouquet.isHit && (
//         <span className="absolute top-2 right-2 z-10 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
//           Хит 🔥
//         </span>
//       )} */}
//       <div className="flex justify-center items-top overflow-hidden min-[260px]:max-[320px]:h-auto h-[300] max-h-[300] max-w-[390] box-border">
//         <Image
//           className="duration-500 md:hover:scale-105"
//           src={bouquet.image || '/placeholder.png'}
//           width={390}
//           height={400}
//           alt="slide"
//         />
//       </div>
//       <div className="h-auto flex items-top pt-3 box-border">
//         <div className="flex flex-col justify-between w-[390]">
//           <div className="text-2xl px-4">{bouquet.title}</div>
//           <div className="text-sm p-3">{bouquet.description}</div>
//           <div className="w-full flex justify-between items-center">
//             <div className="text-lg px-3">от {bouquet.price} ₽</div>
//             <div>
//               {/* Передаем объект bouquet дальше в кнопку заказа */}
//               <OrderBouquetButton bouquet={bouquet} bgColor="bg-[#7E8F52]"/>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
export default function BouquetCard(bouquet: Bouquet) {
  if (!bouquet || !bouquet.title) return null;

  // Безопасное формирование пути к изображению
  let finalImageUrl = bouquet.image || "/placeholder.png";
  if (finalImageUrl.startsWith("/uploads/")) {
    finalImageUrl = `${S3_HOST}/${BUCKET_NAME}${finalImageUrl}`;
  }

  return (
    <div className="min-[260]:max-[320]:w-[240] w-[300] max-w-full mx-auto my-5 flex flex-col justify-center box-border overflow-hidden relative">
      
      {/* Бейдж "Хит" поверх картинки */}
      {/* {bouquet.isHit && (
        <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
          Хит 🔥
        </span>
      )} */}

      <div className="flex justify-center items-top overflow-hidden min-[260px]:max-[320px]:h-auto h-[300] max-h-[300] max-w-[390] box-border">
        <Image
          className="duration-500 md:hover:scale-105"
          src={finalImageUrl} // <-- ИСПОЛЬЗУЕМ СКОРРЕКТИРОВАННЫЙ URL ИЗ S3
          width={390}
          height={400}
          alt="slide"
        />
      </div>
      <div className="h-auto flex items-top pt-3 box-border">
        <div className="flex flex-col justify-between w-[390px]">
          <div className="text-2xl px-4">{bouquet.title}</div>
          <div className="text-sm p-3">{bouquet.description}</div>
          <div className="w-full flex justify-between items-center">
            <div className="text-lg px-3">от {bouquet.price} ₽</div>
            <div>
              <OrderBouquetButton bouquet={bouquet} bgColor="bg-[#7E8F52]"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}