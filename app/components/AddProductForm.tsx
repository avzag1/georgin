'use client';

import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Интерфейс для типизации категории
interface CategoryItem {
  id: number;
  category: string;
} 

interface ProductTableItem {
  id: number;
  title: string;
  price: number;
  category: CategoryItem; 
}

// Функция получения категорий
const fetchCategories = async (): Promise<CategoryItem[]> => {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Ошибка загрузки категорий');
  return res.json();
};

// Функция отправки формы товара
const createProductRequest = async (formData: FormData): Promise<unknown> => {
  const res = await fetch('/api/products', {
    method: 'POST',
    body: formData,
  });
  // if (!res.ok) {
  //   const errorData = await res.json().catch(() => ({ error: 'Ошибка сервера' }));
  //   throw new Error(errorData.error || 'Не удалось добавить товар');
  // }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Ошибка сервера со статусом: ${res.status}`);
  }

  return res.json();
};

const createCategoryRequest = async (name: string): Promise<CategoryItem> => {
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Ошибка сервера' }));
    throw new Error(errorData.error || 'Не удалось создать категорию');
  }
  return res.json();
};

export default function AddProductForm() {
  // Инициализируем queryClient для последующей инвалидации кэша
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);

  // Состояния для модального окна категории
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 1. теперь храним строку, а не ID
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  // const [newCategoryName, setNewCategoryName] = useState('');

   // 1. ЗАГРУЗКА КАТЕГОРИЙ ДЛЯ ВЫПАДАЮЩЕГО СПИСКА
  const { 
    data: categories, 
    isLoading: isCategoriesLoading, 
    isError: isCategoriesError 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // 2. МУТАЦИЯ ДЛЯ СОЗДАНИЯ ТОВАРA
  // Настройка мутации TanStack Query со всей необходимой логикой
  const productMutation = useMutation({
    mutationFn: createProductRequest,
    
    // [1] АВТОМАТИЧЕСКИЕ ПОВТОРЫ (RETRYS) ПРИ ОШИБКЕ СЕТИ
    // По умолчанию мутации в TanStack Query не повторяются, но мы можем это включить
    retry: 3, // В случае сбоя сети (например, 502/503 или обрыв связи), запрос повторится 3 раза
    retryDelay: (attempt) => Math.min(attempt * 1000, 3000), // Задержка между попытками: 1с, 2с, 3с

    // [2] ИНВАЛИДАЦИЯ КЭША ПРИ УСПЕШНОМ ОТВЕТЕ
    onSuccess: (data) => {
      // Инвалидируем кэш по ключу ['products']. 
      // Все компоненты, которые отображают список товаров через useQuery(['products']), 
      // автоматически сделают фоновый перезапрос данных и обновят интерфейс без перезагрузки.
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      formRef.current?.reset(); // Очищаем форму
    },
  });

  // 3. Мутация создания НОВОЙ КАТЕГОРИИ
  const categoryMutation = useMutation({
    mutationFn: createCategoryRequest,
    onSuccess: (newCat) => {
      // Инвалидируем кэш категорий, чтобы селект мгновенно обновился
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSelectedCategoryName(newCat.category);
      setIsModalOpen(false); // Закрываем модалку
      // alert(`Категория "${newCat.category}" успешно создана!`);
    },
    onError: (error: Error) => {
      // alert(`Ошибка: ${error.message}`);
    },
  });

  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Запускаем процесс мутации
    productMutation.mutate(formData);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    categoryMutation.mutate(selectedCategoryName);
  };

  return (
    <div className="max-w-md mx-auto mt-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Добавление товара</h2>
      
      {/* [3] УПРАВЛЕНИЕ СОСТОЯНИЯМИ: ВЫВОД ОШИБОК И УСПЕХА */}
      {productMutation.isSuccess && (
        <div className="p-3 mb-4 text-sm text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200">
          ✓ Товар успешно добавлен!
        </div>
      )}

      {productMutation.isError && (
        <div className="p-3 mb-4 text-sm text-rose-800 bg-rose-50 rounded-lg border border-rose-200">
          ⚠️ Ошибка (Попыток отправки: {productMutation.failureCount}): {productMutation.error.message}
        </div>
      )}

      <form ref={formRef} onSubmit={handleProductSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Название</label>
          <input
            type="text"
            name="title"
            required
            disabled={productMutation.isPending} // Блокируем инпуты во время отправки
            placeholder="Введите название товара"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Цена (₽)</label>
          <input
            type="number"
            name="price"
            required
            min="0"
            step="0.01"
            disabled={productMutation.isPending}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Цена по акции (₽)</label>
          <input
            type="number"
            name="actionPrice"
            min="0"
            step="0.01"
            disabled={productMutation.isPending}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Количество на складе</label>
          <input
            type="number"
            name="quantityInStore"
            min="0"
            step="1"
            disabled={productMutation.isPending}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Изображение товара</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            required
            disabled={productMutation.isPending}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Описание</label>
          <input
            type="text"
            name="description"
            required
            disabled={productMutation.isPending} // Блокируем инпуты во время отправки
            placeholder="Введите описание товара"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        {/* Выпадающий список + Кнопка «+» */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase">Категория</label>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              + Создать категорию
            </button>
          </div>
          
          <select
            name="categoryName"
            required
            value={selectedCategoryName}
            onChange={(e) => setSelectedCategoryName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Выберите категорию --</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.category}>
                {cat.category}
              </option>
            ))}
          </select>
        </div>

        {/* [3] УПРАВЛЕНИЕ СОСТОЯНИЯМИ: ИНДИКАТОР ЗАГРУЗКИ КНОПКИ */}
        <button
          type="submit"
          disabled={productMutation.isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:bg-indigo-300 flex justify-center items-center gap-2"
        >
          {productMutation.isPending ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {productMutation.failureCount > 0 
                ? `Переотправка (попытка ${productMutation.failureCount})...` 
                : 'Сохранение товара...'}
            </>
          ) : (
            'Создать и загрузить'
          )}
        </button>
      </form>

      {/* МОДАЛЬНОЕ ОКНО ДЛЯ СОЗДАНИЯ КАТЕГОРИИ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold text-gray-900">Новая категория</h3>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Название категории</label>
                <input
                  type="text"
                  required
                  value={selectedCategoryName}
                  onChange={(e) => setSelectedCategoryName(e.target.value)}
                  placeholder="Например, Одежда"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={categoryMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:bg-indigo-300"
                >
                  {categoryMutation.isPending ? 'Создание...' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
