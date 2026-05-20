"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProductRowAdmin from "@/app/components/ProductRowAdmin";
import EditProductModal from "@/app/components/EditProductModal";

interface ProductWithOrders {
  id: number;
  image: string;
  title: string;
  description: string;
  price: number;
  actionPrice: number;
  categoryName: string;
  quantityInStore: number;
  orderProducts: { quantityInOrder: number }[];
}

interface CategoryItem {
  id: number;
  category: string;
}

// АСИНХРОННЫЕ ФУНКЦИИ ЗАПРОСОВ К API
const fetchActiveProducts = async (): Promise<ProductWithOrders[]> => {
  const res = await fetch('/api/products?archived=false');
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Ошибка: ${res.status}`);
  return data || [];
};

const fetchArchivedProducts = async (): Promise<ProductWithOrders[]> => {
  const res = await fetch('/api/products?archived=true');
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Ошибка: ${res.status}`);
  return data || [];
};

const fetchCategories = async (): Promise<CategoryItem[]> => {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Ошибка загрузки категорий');
  return res.json();
};

const deleteProductRequest = async (id: number): Promise<{ success: boolean }> => {
  const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Не удалось удалить товар');
  return data;
};

const restoreProductRequest = async (id: number): Promise<unknown> => {
  const res = await fetch(`/api/products/archive?id=${id}`, { method: 'PATCH' });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Не удалось восстановить товар');
  return data;
};

export default function ProductsBlockAdmin() {
  const queryClient = useQueryClient();
  const [showProducts, setShowProducts] = useState(false);
  const [currentTab, setCurrentTab] = useState<'stock' | 'archive'>('stock');
  const [editingProduct, setEditingProduct] = useState<ProductWithOrders | null>(null);

  // ✅ ЛОКАЛЬНЫЕ СОСТОЯНИЯ ДЛЯ ПОИСКА И ФИЛЬТРАЦИИ
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // ЗАГРУЗКА ДАННЫХ ИЗ ПОСТГРЕСА
  const activeQuery = useQuery({
    queryKey: ['products', 'active'],
    queryFn: fetchActiveProducts,
    enabled: showProducts,
  });

  const archiveQuery = useQuery({
    queryKey: ['products', 'archived'],
    queryFn: fetchArchivedProducts,
    enabled: showProducts && currentTab === 'archive',
  });

  // Загружаем существующие категории для фильтра
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: showProducts,
  });

  // Межвкладочная синхронизация
  useEffect(() => {
    const channel = new BroadcastChannel('shop_cart_updates');
    channel.onmessage = (event) => {
      if (event.data === 'cart_changed') {
        queryClient.invalidateQueries({ queryKey: ['products'], exact: false });
      }
    };
    return () => channel.close();
  }, [queryClient]);

  // МУТАЦИИ
  const deleteMutation = useMutation({
    mutationFn: deleteProductRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'], exact: false });
      alert('Товар успешно перенесен в архив');
    },
    onError: (err: Error) => alert(`Ошибка удаления: ${err.message}`),
  });

  const restoreMutation = useMutation({
    mutationFn: restoreProductRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'], exact: false });
      alert('Товар успешно возвращен на склад!');
    },
    onError: (err: Error) => alert(`Ошибка восстановления: ${err.message}`),
  });

  const handleDeleteClick = (id: number, title: string) => {
    if (window.confirm(`Вы уверены, что хотите перенести товар "${title}" в архив?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleRestoreClick = (id: number, title: string) => {
    if (window.confirm(`Восстановить товар "${title}" обратно на склад?`)) {
      restoreMutation.mutate(id);
    }
  };

  const isArchive = currentTab === 'archive';
  const currentQuery = isArchive ? archiveQuery : activeQuery;
  const rawProducts = currentQuery.data || [];

  // ✅ ЖИВАЯ ФИЛЬТРАЦИЯ И КОНТЕКСТНЫЙ ПОИСК (Мгновенно на клиенте)
  const displayedProducts = rawProducts.filter((product) => {
    // Проверка по поисковому запросу (приводим к нижнему регистру для регистронезависимости)
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Проверка по выбранной категории (если выбрано "" — пропускаем все)
    const matchesCategory = selectedCategory === "" || product.categoryName === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 flex flex-col items-center w-full">
      <button
        type="button"
        onClick={() => setShowProducts(!showProducts)}
        className="w-50 border p-3 m-5 bg-amber-100 font-medium rounded hover:bg-amber-200 transition-colors"
      >
        {showProducts ? "Скрыть панель" : "Управление товарами"}
      </button>

      <div className={showProducts ? "flex flex-col w-full overflow-x-auto" : "hidden"}>
        
        {/* НАВИГАЦИОННЫЕ ВКЛАДКИ */}
        <div className="flex gap-4 border-b mb-4 w-full">
          <button
            type="button"
            onClick={() => { setCurrentTab('stock'); setSearchQuery(''); setSelectedCategory(''); }}
            className={`pb-2 px-4 font-semibold text-sm transition-all ${
              !isArchive ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Активный склад ({activeQuery.data?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => { setCurrentTab('archive'); setSearchQuery(''); setSelectedCategory(''); }}
            className={`pb-2 px-4 font-semibold text-sm transition-all ${
              isArchive ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Архив / Удаленные ({archiveQuery.data?.length || 0})
          </button>
        </div>

        {/* ✅ БЛОК ИНПУТОВ: ПОИСК И ФИЛЬТР (Добавлен) */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full max-w-2xl bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Поиск по названию</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Введите название букета..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <div className="w-full sm:w-56">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Фильтр категорий</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Все категории</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.category}>{cat.category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Шапка таблицы */}
        <div className="flex gap-2 font-bold border-b pb-2 mb-2 text-sm text-gray-700 min-w-[800px]">
          <div className="w-30 text-center">Товар</div>
          <div className="w-40 text-center">Описание</div>
          <div className="w-25 text-center">Цена</div>
          <div className="w-25 text-center">Цена по акции</div>
          <div className="w-30 text-center">Категория</div>
          <div className="w-25 text-center">Количество</div>
          <div className="w-44 text-center">Изображение</div>
          <div className="w-25 text-center">В корзинах</div>
        </div>

        {/* Индикаторы загрузки и пустых состояний */}
        {currentQuery.isLoading && (
          <div className="p-8 text-center text-gray-500">Загрузка данных из базы...</div>
        )}

        {!currentQuery.isLoading && displayedProducts.length === 0 && (
          <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed">
            {rawProducts.length === 0 
              ? (isArchive ? "Раздел архива пуст" : "На активном складе нет товаров")
              : "Нет товаров, соответствующих условиям поиска"}
          </div>
        )}

        {/* Вывод отфильтрованного списка строк */}
        {!currentQuery.isLoading && displayedProducts.map((product) => (
          <ProductRowAdmin
            key={product.id}
            title={product.title}
            description={product.description}
            image={product.image}
            price={product.price}
            actionPrice={product.actionPrice}
            category={product.categoryName}
            quantityInStore={product.quantityInStore}
            inShoppingCards={
              product.orderProducts?.reduce((acc, order) => acc + order.quantityInOrder, 0) || 0
            }
            isArchiveMode={isArchive}
            onEdit={() => setEditingProduct(product)}
            onDelete={() => handleDeleteClick(product.id, product.title)}
            onRestore={() => handleRestoreClick(product.id, product.title)}
          />
        ))}
      </div>

      <EditProductModal
        key={editingProduct ? editingProduct.id : 'closed'} 
        product={editingProduct}
        onClose={() => setEditingProduct(null)} 
      />
    </div>
  );
}