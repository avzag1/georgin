'use client';

import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Асинхронная функция отправки FormData на сервер
const createProductRequest = async (formData: FormData) => {
  const res = await fetch('/api/products', {
    method: 'POST',
    body: formData, // Браузер сам выставит multipart/form-data
  });

  if (!res.ok) {
    // Выбрасываем ошибку, чтобы TanStack Query перехватил её в onError и запустил повторы
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Не удалось сохранить товар');
  }
  return res.json();
};

export default function AddProductAdmin() {
  // Инициализируем queryClient для последующей инвалидации кэша
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);

  // Настройка мутации TanStack Query со всей необходимой логикой
  const mutation = useMutation({
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Запускаем процесс мутации
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-md mx-auto mt-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Добавление товара</h2>
      
      {/* [3] УПРАВЛЕНИЕ СОСТОЯНИЯМИ: ВЫВОД ОШИБОК И УСПЕХА */}
      {mutation.isSuccess && (
        <div className="p-3 mb-4 text-sm text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200">
          ✓ Товар успешно добавлен и кэш обновлен!
        </div>
      )}

      {mutation.isError && (
        <div className="p-3 mb-4 text-sm text-rose-800 bg-rose-50 rounded-lg border border-rose-200">
          ⚠️ Ошибка (Попыток отправки: {mutation.failureCount}): {mutation.error.message}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Название</label>
          <input
            type="text"
            name="title"
            required
            disabled={mutation.isPending} // Блокируем инпуты во время отправки
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
            disabled={mutation.isPending}
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
            disabled={mutation.isPending}
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
            disabled={mutation.isPending}
            placeholder="0.00"
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
            disabled={mutation.isPending}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Описание</label>
          <input
            type="text"
            name="description"
            required
            disabled={mutation.isPending} // Блокируем инпуты во время отправки
            placeholder="Введите описание товара"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Категория</label>
          <input
            type="text"
            name="category"
            required
            disabled={mutation.isPending} // Блокируем инпуты во время отправки
            placeholder="Введите категорию товара"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        {/* [3] УПРАВЛЕНИЕ СОСТОЯНИЯМИ: ИНДИКАТОР ЗАГРУЗКИ КНОПКИ */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:bg-indigo-300 flex justify-center items-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {mutation.failureCount > 0 
                ? `Переотправка (попытка ${mutation.failureCount})...` 
                : 'Сохранение товара...'}
            </>
          ) : (
            'Создать и загрузить'
          )}
        </button>
      </form>
    </div>
  );
}
