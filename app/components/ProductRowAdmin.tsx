import Image from "next/image";

interface ProductRowProps {
  title: string;
  description: string;
  image: string;
  price: number;
  actionPrice: number;
  category: string;
  quantityInStore: number;
  inShoppingCards: number;
  onEdit: () => void;
  onDelete: () => void;
  // Новые пропсы для поддержки архива
  isArchiveMode?: boolean;
  onRestore?: () => void;
}

export default function ProductRowAdmin({
  title,
  description,
  image,
  price,
  actionPrice,
  category,
  quantityInStore,
  inShoppingCards,
  onEdit,
  onDelete,
  isArchiveMode = false, // По умолчанию режим обычного склада
  onRestore,
}: ProductRowProps) {
  return (
    <div className="flex items-center w-full border-b p-2 text-center text-sm text-gray-800">
      <div className="min-w-30 w-30 text-center p-2">{title}</div>
      <div className="min-w-80 w-80 h-auto text-center p-2">{description}</div>
      <div className="min-w-25 w-25 text-center p-2">{price} ₽</div>
      <div className="min-w-25 w-25 text-center p-2">{actionPrice} ₽</div>
      <div className="min-w-30 w-30 text-center p-2 truncate">{category}</div>
      <div className="min-w-25 w-25 text-center p-2">{quantityInStore} шт</div>
      <div className="min-w-44 w-44 flex justify-center p-2">
        <Image
          className="min-w-20 w-20 h-auto object-cover rounded border"
          src={image || '/placeholder.png'}
          alt="Изображение товара"
          width={40}
          height={40}
        />
      </div>
      <div className="min-w-25 w-25 text-center p-2">{inShoppingCards} шт</div>
      
      {isArchiveMode ? (
        // Кнопка для режима Архива
        <button 
          type="button"
          onClick={onRestore}
          className="px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition-all ml-auto"
        >
          Восстановить
        </button>
      ) : (
        // Стандартные кнопки управления активным складом
        <>
          <button 
            type="button"
            onClick={onEdit}
            className="px-2 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-100 transition-all"
          >
            Изменить
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex justify-center items-center ml-2 p-2 rounded hover:bg-rose-50 transition-colors"
            title="Перенести в архив"
          >
            <Image src="/deleteIcon.png" alt="Удалить" width={16} height={17} />
          </button>
        </>
      )}
    </div>
  );
}