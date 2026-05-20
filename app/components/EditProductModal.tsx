'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface CategoryItem {
  id: number;
  category: string;
}

interface ProductData {
  id: number;
  title: string;
  description: string;
  price: number;
  actionPrice: number;
  categoryName: string;
  quantityInStore: number;
  image: string;
}

interface EditModalProps {
  product: ProductData | null;
  onClose: () => void;
}

const fetchCategories = async (): Promise<CategoryItem[]> => {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Ошибка загрузки категорий');
  return res.json();
};

const updateProductRequest = async (formData: FormData) => {
  const res = await fetch('/api/products', { 
    method: 'PUT', 
    body: formData 
  });
  // Читаем текст ответа напрямую
  const textData = await res.text();
  
  if (!res.ok) {
    let errorMessage = `Сервер вернул код ${res.status}`;
    try {
      // Пробуем распарсить JSON, если сервер его прислал
      const jsonData = JSON.parse(textData);
      if (jsonData?.error) errorMessage = jsonData.error;
    } catch {
      // Если там не JSON, а обычный текст (например, лог Prisma) — берем первые 100 символов
      if (textData) errorMessage = textData.slice(0, 150);
    }
    throw new Error(errorMessage);
  }
  // Если всё хорошо, парсим финальный JSON товара
  return JSON.parse(textData);
};

export default function EditProductModal({ product, onClose }: EditModalProps) {
  const queryClient = useQueryClient();

  // ИСПРАВЛЕНИЕ: Инициализируем стейт сразу из пропсов, без useEffect
  const [title, setTitle] = useState(product?.title ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product?.price ?? 0);
  const [actionPrice, setActionPrice] = useState(product?.actionPrice ?? 0);
  const [categoryName, setCategoryName] = useState(product?.categoryName ?? '');
  const [quantityInStore, setQuantityInStore] = useState(product?.quantityInStore ?? 0);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const mutation = useMutation({
    mutationFn: updateProductRequest,
    onSuccess: () => {
      // ✅ ИСПРАВЛЕНИЕ: Добавляем exact: false для сквозного обновления таблиц
      queryClient.invalidateQueries({ queryKey: ['products'], exact: false });
      onClose();
      alert('Товар успешно обновлен!');
    },
    onError: (err: Error) => {
      alert(`Ошибка: ${err.message}`);
    },
  });

  if (!product) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('id', String(product.id));
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl border w-full max-w-md p-6 max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="font-bold text-gray-950">Редактирование товара #{product.id}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-0.5">Название</label>
            <input
              type="text"
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-0.5">Описание</label>
            <textarea
              name="description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-0.5">Цена (₽)</label>
              <input
                type="number"
                name="price"
                required
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-0.5">По акции (₽)</label>
              <input
                type="number"
                name="actionPrice"
                step="0.01"
                value={actionPrice}
                onChange={(e) => setActionPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-0.5">Категория</label>
              <select
                name="categoryName"
                required
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Выбрать --</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.category}>{cat.category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-0.5">Кол-во на складе</label>
              <input
                type="number"
                name="quantityInStore"
                value={quantityInStore}
                onChange={(e) => setQuantityInStore(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-0.5">Заменить изображение (необязательно)</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="w-full text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:bg-indigo-300"
            >
              {mutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}