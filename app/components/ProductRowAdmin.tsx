"use client";

import Image from "next/image";

// 1. Описываем строгие интерфейсы пропсов, чтобы TypeScript видел функции удаления и восстановления
interface ProductRowAdminProps {
  title: string;
  description: string;
  image: string;
  price: number;
  actionPrice: number;
  category: string;
  quantityInStore: number;
  inShoppingCards: number;
  isArchiveMode: boolean; // Флаг: находимся ли мы на вкладке архива
  onEdit: () => void;
  onDelete: () => void;   // Функция отправки в архив
  onRestore: () => void;  // Функция восстановления из архива
}

// 2. Экспортируем как default, чтобы удовлетворить требование ts(2614)
export default function ProductRowAdmin({
  title,
  description,
  image,
  price,
  actionPrice,
  category,
  quantityInStore,
  inShoppingCards,
  isArchiveMode,
  onEdit,
  onDelete,
  onRestore
}: ProductRowAdminProps) {
  return (
    <div className="flex gap-2 items-center border-b py-2 text-sm text-gray-600 min-w-[800px] bg-white hover:bg-gray-50/50 transition-colors">
      <div className="w-30 text-center font-semibold text-gray-900 truncate px-1">{title}</div>
      <div className="w-40 text-center truncate px-1 text-gray-500">{description}</div>
      <div className="w-25 text-center font-mono">{price.toLocaleString('ru-RU')} ₽</div>
      <div className="w-25 text-center font-mono text-amber-600 font-medium">
        {actionPrice > 0 ? `${actionPrice.toLocaleString('ru-RU')} ₽` : "—"}
      </div>
      <div className="w-30 text-center">
        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{category}</span>
      </div>
      <div className="w-25 text-center font-bold">{quantityInStore} шт.</div>
      <div className="w-44 flex justify-center">
        <div className="relative w-16 h-10 border rounded overflow-hidden bg-gray-50">
          <Image 
            src={image || "/placeholder-bouquet.png"} 
            alt={title} 
            fill 
            className="object-cover" 
            sizes="64px" 
          />
        </div>
      </div>
      <div className="w-25 text-center font-medium text-indigo-600">{inShoppingCards} шт.</div>

      {/* ✅ СЕКЦИЯ ДЕЙСТВИЙ: Кнопки выведены и привязаны к пропсам удаления/восстановления */}
      <div className="w-32 flex gap-1 justify-center px-2">
        <button
          type="button"
          onClick={onEdit}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer focus:outline-none"
          title="Редактировать товар"
        >
          ✏️
        </button>

        {isArchiveMode ? (
          // Если текущая вкладка — "Архив / Удаленные", рендерится кнопка восстановления
          <button
            type="button"
            onClick={onRestore}
            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition-colors cursor-pointer focus:outline-none whitespace-nowrap"
          >
            Восстановить
          </button>
        ) : (
          // Если текущая вкладка — "Активный склад", рендерится кнопка отправки в архив
          <button
            type="button"
            onClick={onDelete}
            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded transition-colors cursor-pointer focus:outline-none whitespace-nowrap"
          >
            В архив
          </button>
        )}
      </div>
    </div>
  );
}


// import Image from "next/image";

// interface ProductRowProps {
//   title: string;
//   description: string;
//   image: string;
//   price: number;
//   actionPrice: number;
//   category: string;
//   quantityInStore: number;
//   inShoppingCards: number;
//   onEdit: () => void;
//   onDelete: () => void;
//   // Новые пропсы для поддержки архива
//   isArchiveMode?: boolean;
//   onRestore?: () => void;
// }

// export default function ProductRowAdmin({
//   title,
//   description,
//   image,
//   price,
//   actionPrice,
//   category,
//   quantityInStore,
//   inShoppingCards,
//   onEdit,
//   onDelete,
//   isArchiveMode = false, // По умолчанию режим обычного склада
//   onRestore,
// }: ProductRowProps) {
//   return (
//     <div className="flex items-center w-full border-b p-2 text-center text-sm text-gray-800">
//       <div className="min-w-30 w-30 text-center p-2">{title}</div>
//       <div className="min-w-80 w-80 h-auto text-center p-2">{description}</div>
//       <div className="min-w-25 w-25 text-center p-2">{price} ₽</div>
//       <div className="min-w-25 w-25 text-center p-2">{actionPrice} ₽</div>
//       <div className="min-w-30 w-30 text-center p-2 truncate">{category}</div>
//       <div className="min-w-25 w-25 text-center p-2">{quantityInStore} шт</div>
//       <div className="min-w-44 w-44 flex justify-center p-2">
//         <Image
//           className="min-w-20 w-20 h-auto object-cover rounded border"
//           src={image || '/placeholder.png'}
//           alt="Изображение товара"
//           width={40}
//           height={40}
//         />
//       </div>
//       <div className="min-w-25 w-25 text-center p-2">{inShoppingCards} шт</div>
      
//       {isArchiveMode ? (
//         // Кнопка для режима Архива
//         <button 
//           type="button"
//           onClick={onRestore}
//           className="px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition-all ml-auto"
//         >
//           Восстановить
//         </button>
//       ) : (
//         // Стандартные кнопки управления активным складом
//         <>
//           <button 
//             type="button"
//             onClick={onEdit}
//             className="px-2 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-100 transition-all"
//           >
//             Изменить
//           </button>
//           <button
//             type="button"
//             onClick={onDelete}
//             className="flex justify-center items-center ml-2 p-2 rounded hover:bg-rose-50 transition-colors"
//             title="Перенести в архив"
//           >
//             <Image src="/deleteIcon.png" alt="Удалить" width={16} height={17} />
//           </button>
//         </>
//       )}
//     </div>
//   );
// }