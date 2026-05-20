'use client';

import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Интерфейс для типизации категории
interface CategoryItem {
  id: number;
  category: string;
}

// 1. АСИНХРОННЫЕ ФУНКЦИИ ЗАПРОСОВ К СЕРВЕРУ (FETCH)

// Получение списка всех категорий
const fetchCategories = async (): Promise<CategoryItem[]> => {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Ошибка загрузки категорий');
  return res.json();
};

// Создание нового товара (передача FormData для поддержки загрузки файлов)
const createProductRequest = async (formData: FormData): Promise<unknown> => {
  const res = await fetch('/api/products', {
    method: 'POST',
    body: formData, // Браузер сам выставит multipart/form-data заголовок
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Ошибка сервера' }));
    throw new Error(errorData.error || 'Не удалось сохранить товар');
  }
  return res.json();
};

// Создание новой категории
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

// Удаление существующей категории
const deleteCategoryRequest = async (id: number): Promise<{ success: boolean }> => {
  const res = await fetch(`/api/categories?id=${id}`, {
    method: 'DELETE',
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Не удалось удалить категорию');
  return data;
};

// 2. ГЛАВНЫЙ КОМПОНЕНТ ФОРМЫ

export default function AddProductForm() {
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  
  // Состояния для управления модальным окном категорий
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Состояние контролируемого выпадающего списка (хранит строку названия категории для СУБД)
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');

  // Хук TanStack Query: получение категорий из БД
  const { data: categories, isLoading: isCatsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Мутация: Создание товара
  const productMutation = useMutation({
    mutationFn: createProductRequest,
    onSuccess: () => {
      // Автоматически обновляем кэш витрины и таблицы админки
      queryClient.invalidateQueries({ queryKey: ['products'] });
      formRef.current?.reset();
      setSelectedCategoryName(''); // Сбрасываем выпадающий список после успеха
      alert('Товар успешно добавлен на склад!');
    },
    onError: (error: Error) => {
      alert(`Ошибка добавления товара: ${error.message}`);
    },
  });

  // Мутация: Создание новой категории с авто-фокусом
  const categoryMutation = useMutation({
    mutationFn: createCategoryRequest,
    onSuccess: (newCat: CategoryItem) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      // Автоматически выставляем текстовое название новой категории в состояние селекта
      setSelectedCategoryName(newCat.category);
      
      setNewCategoryName('');
      setIsModalOpen(false); // Закрываем модалку
    },
    onError: (error: Error) => {
      alert(`Ошибка: ${error.message}`);
    },
  });

  // Мутация: Удаление категории
  const categoryDeleteMutation = useMutation({
    mutationFn: deleteCategoryRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Обновляем товары, т.к. они удалились каскадом
      setSelectedCategoryName(''); // Сбрасываем текущий выбор
      alert('Категория успешно удалена!');
    },
    onError: (error: Error) => {
      alert(`Ошибка: ${error.message}`);
    },
  });

  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    productMutation.mutate(formData);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    categoryMutation.mutate(newCategoryName);
  };

  return (
    <div className="w-full mx-auto mt-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm relative">
      <h2 className="text-lg text-center font-bold text-gray-900 mb-4">Добавление товара</h2>

      <form ref={formRef} onSubmit={handleProductSubmit} className="gap-4 flex flex-wrap">
        {/* Название */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Название товара</label>
          <input
            type="text"
            name="title"
            required
            disabled={productMutation.isPending}
            placeholder="Например, Букет Роз"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
          />
        </div>

        {/* Детальное описание (Превращено в полноценный тег textarea высотой в 4 строки) */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Описание</label>
          <textarea
            name="description"
            required
            rows={4} // Высота в 4 строчки
            disabled={productMutation.isPending}
            placeholder="Введите описание товара"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400 resize-y"
          />
        </div>

        {/* Сетка: Цена и Количество */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Цена (₽)</label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="1"
              disabled={productMutation.isPending}
              placeholder="0.00"
              className="w-35 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Кол-во на складе</label>
            <input
              type="number"
              name="quantityInStore"
              required
              min="0"
              disabled={productMutation.isPending}
              placeholder="0"
              className="w-35 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* Выпадающий список категорий с контролируемым значением */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase">Категория</label>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              + Настройка категорий
            </button>
          </div>
          
          <select
            name="categoryName" // Бэкенд запишет эту строку напрямую в PostgreSQL
            required
            value={selectedCategoryName}
            onChange={(e) => setSelectedCategoryName(e.target.value)}
            disabled={productMutation.isPending || isCatsLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
          >
            <option value="">-- Выберите категорию --</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.category}>
                {cat.category}
              </option>
            ))}
          </select>
        </div>

        {/* Изображение товара */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Изображение букета</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            required
            disabled={productMutation.isPending}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        {/* Кнопка отправки формы */}
        <button
          type="submit"
          disabled={productMutation.isPending || isCatsLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:bg-indigo-300 flex justify-center items-center gap-2"
        >
          {productMutation.isPending ? 'Сохранение товара...' : 'Создать товар'}
        </button>
      </form>

      {/* 3. МОДАЛЬНОЕ ОКНО ДЛЯ УПРАВЛЕНИЯ КАТЕГОРИЯМИ (ДОБАВЛЕНИЕ + КАСКАДНОЕ УДАЛЕНИЕ) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 max-w-sm w-full space-y-4">
            
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-md font-bold text-gray-900">Категории</h3>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Менеджер существующих категорий с кнопками удаления */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Текущие разделы (Каскадное удаление)</label>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1 bg-gray-50">
                {categories?.length === 0 && <p className="text-xs text-gray-400 p-1">Категорий в базе нет</p>}
                {categories?.map((cat) => (
                  <div key={cat.id} className="flex justify-between items-center bg-white p-1.5 px-2.5 rounded-md border text-xs text-gray-700 shadow-2xs">
                    <span>{cat.category}</span>
                    <button
                      type="button"
                      disabled={categoryDeleteMutation.isPending}
                      onClick={() => {
                        if (window.confirm(`Вы уверены, что хотите удалить категорию "${cat.category}"? Это действие каскадно удалит все связанные букеты из PostgreSQL!`)) {
                          categoryDeleteMutation.mutate(cat.id);
                        }
                      }}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-800 transition-colors p-1"
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Форма создания новой категории */}
            <form onSubmit={handleCategorySubmit} className="space-y-3 pt-2 border-t">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Название новой рубрики</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Например, Моно букеты"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="flex gap-2 justify-end text-xs">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Закрыть
                </button>
                <button
                  type="submit"
                  disabled={categoryMutation.isPending}
                  className="px-4 py-2 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:bg-indigo-300"
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