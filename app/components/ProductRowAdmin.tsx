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
  isHit: boolean;
  isAction: boolean;
  onToggleHit: () => void;
  onToggleAction: () => void;
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
  isHit,
  isAction,
  onToggleHit,
  onToggleAction,
  onEdit,
  onDelete,
  onRestore
}: ProductRowAdminProps) {
  return (
    <div className="flex gap-2 items-center border-b py-2 text-sm text-gray-600 min-w-[900] bg-white hover:bg-gray-50/50 transition-colors">
      {/* ЧЕКБОКС ХИТА (Вставляем в начало строки) */}
      <div className="w-16 min-w-16 flex justify-center items-center">
        <input 
          type="checkbox" 
          checked={isHit}
          onChange={onToggleHit}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
          title="Отметить как хит продаж"
        />
      </div>
      <div className="w-16 min-w-16 flex justify-center items-center">
        <input 
          type="checkbox" 
          checked={isAction}
          onChange={onToggleAction}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
          title="Отметить как акцию"
        />
      </div>
      <div className="w-80 min-w-80 text-center font-semibold text-gray-900 truncate px-1">{title}</div>
      <div className="w-40 min-w-40 text-center truncate px-1 text-gray-500">{description}</div>
      <div className="w-25 min-w-25 text-center font-mono">{price.toLocaleString('ru-RU')} ₽</div>
      <div className="w-25 min-w-25 text-center font-mono text-amber-600 font-medium">
        {actionPrice > 0 ? `${actionPrice.toLocaleString('ru-RU')} ₽` : "—"}
      </div>
      <div className="w-30 min-w-30 text-center">
        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{category}</span>
      </div>
      <div className="w-25 min-w-25 text-center font-bold">{quantityInStore} шт.</div>
      <div className="w-44 min-w-44 flex justify-center">
        <div className="relative w-14 h-14 border rounded overflow-hidden bg-gray-50">
          <Image 
            src={image || "/placeholder-bouquet.png"} 
            alt={title} 
            fill 
            className="object-cover" 
            sizes="64px" 
          />
        </div>
      </div>
      <div className="w-25 min-w-25 text-center font-medium text-indigo-600">{inShoppingCards} шт.</div>

      {/* СЕКЦИЯ ДЕЙСТВИЙ: Кнопки выведены и привязаны к пропсам удаления/восстановления */}
      <div className="w-32 min-w-32 flex gap-1 justify-center px-2">
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