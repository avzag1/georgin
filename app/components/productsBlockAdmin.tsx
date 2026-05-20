"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProductRowAdmin from "@/app/components/ProductRowAdmin";
import EditProductModal from "@/app/components/EditProductModal";

// 1. ИНТЕРФЕЙСЫ СТРУКТУРЫ ДАННЫХ ДЛЯ TYPESCRIPT
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

interface OrderItemAdmin {
  id: number;
  createdAt: string;
  comment?: string; // Поле комментария из Prisma
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  orderProducts: {
    id: number;
    quantityInOrder: number;
    product: {
      title: string;
      price: number;
    };
  }[];
}

// 2. АСИНХРОННЫЕ FETCH-ЗАПРОСЫ К API-МАРШРУТАМ
const fetchActiveProducts = async (): Promise<ProductWithOrders[]> => {
  const res = await fetch("/api/products?archived=false");
  if (!res.ok) throw new Error("Ошибка загрузки склада");
  return res.json();
};

const fetchArchivedProducts = async (): Promise<ProductWithOrders[]> => {
  const res = await fetch("/api/products?archived=true");
  if (!res.ok) throw new Error("Ошибка загрузки архива товаров");
  return res.json();
};

const fetchCategories = async (): Promise<CategoryItem[]> => {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Ошибка загрузки категорий");
  return res.json();
};

const fetchOrdersAdmin = async (): Promise<OrderItemAdmin[]> => {
  const res = await fetch("/api/orders?archived=false");
  if (!res.ok) throw new Error("Не удалось загрузить заказы");
  return res.json();
};

const fetchArchivedOrdersAdmin = async (): Promise<OrderItemAdmin[]> => {
  const res = await fetch("/api/orders?archived=true");
  if (!res.ok) throw new Error("Не удалось загрузить архив заказов");
  return res.json();
};

const archiveOrderRequest = async (id: number): Promise<unknown> => {
  const res = await fetch(`/api/orders?id=${id}`, { method: "PATCH" });
  if (!res.ok) throw new Error("Не удалось перенести заказ в архив");
  return res.json();
};

const deleteProductRequest = async (id: number) => {
  const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Не удалось удалить товар");
  return res.json();
};

const restoreProductRequest = async (id: number) => {
  const res = await fetch(`/api/products/archive?id=${id}`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Не удалось восстановить товар");
  return res.json();
};

// 3. ГЛАВНЫЙ КОМПОНЕНТ ПАНЕЛИ
export default function ProductsBlockAdmin() {
  const queryClient = useQueryClient();

  // Панель всегда раскрыта по умолчанию, так как управляющую кнопку мы убрали
  const [showProducts] = useState(true);

  // Четыре вкладки навигации
  const [currentTab, setCurrentTab] = useState<
    "stock" | "archive" | "orders" | "order_archive"
  >("stock");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingProduct, setEditingProduct] =
    useState<ProductWithOrders | null>(null);

  // ПАРАЛЛЕЛЬНЫЙ СИНХРОННЫЙ СБОР КЭШЕЙ (ПОЛИНГ КАЖДЫЕ 4 СЕКУНДЫ)
  const activeQuery = useQuery({
    queryKey: ["products", "active"],
    queryFn: fetchActiveProducts,
    enabled: showProducts,
    refetchInterval: 4000,
  });

  const archiveQuery = useQuery({
    queryKey: ["products", "archived"],
    queryFn: fetchArchivedProducts,
    enabled: showProducts,
    refetchInterval: 4000,
  });

  const ordersQuery = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: fetchOrdersAdmin,
    enabled: showProducts,
    refetchInterval: 4000,
  });

  const archivedOrdersQuery = useQuery({
    queryKey: ["admin", "orders", "archived"],
    queryFn: fetchArchivedOrdersAdmin,
    enabled: showProducts,
    refetchInterval: 4000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: showProducts,
  });

  // Синхронизация между вкладками браузера (Web API BroadcastChannel)
  useEffect(() => {
    const channel = new BroadcastChannel("shop_cart_updates");
    channel.onmessage = (event) => {
      if (event.data === "cart_changed") {
        queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
        queryClient.invalidateQueries({
          queryKey: ["admin", "orders"],
          exact: false,
        });
      }
    };
    return () => channel.close();
  }, [queryClient]);

  // МУТАЦИИ УПРАВЛЕНИЯ СОСТОЯНИЯМИ СУБД
  const archiveOrderMutation = useMutation({
    mutationFn: archiveOrderRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "orders"],
        exact: false,
      });
      alert("Заказ успешно выполнен и перенесен в архив!");
    },
    onError: (err: Error) => alert(`Ошибка: ${err.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["products"], exact: false }),
  });

  const restoreMutation = useMutation({
    mutationFn: restoreProductRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["products"], exact: false }),
  });

  const isArchive = currentTab === "archive";
  const isOrdersTab = currentTab === "orders";
  const isOrderArchiveTab = currentTab === "order_archive";

  // Динамическое определение активного запроса на основе вкладки
  const currentQuery = isArchive ? archiveQuery : activeQuery;
  const rawProducts = isArchive
    ? archiveQuery.data || []
    : activeQuery.data || [];

  // Живая фильтрация и контекстный поиск по товарам (на клиенте)
  const displayedProducts = rawProducts.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || product.categoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteClick = (id: number, title: string) => {
    if (
      window.confirm(
        `Вы уверены, что хотите перенести товар "${title}" в архив?`,
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const handleRestoreClick = (id: number, title: string) => {
    if (window.confirm(`Восстановить товар "${title}" обратно на склад?`)) {
      restoreMutation.mutate(id);
    }
  };

  const handleArchiveOrderClick = (id: number) => {
    if (
      window.confirm(
        `Пометить заказ #${id} как выполненный и убрать его из списка?`,
      )
    ) {
      archiveOrderMutation.mutate(id);
    }
  };

  // Перехват экрана загрузки текущей выбранной вкладки товаров
  if (currentQuery.isLoading && !isOrdersTab && !isOrderArchiveTab) {
    return (
      <div className="p-12 text-center font-semibold text-gray-500">
        Синхронизация данных с PostgreSQL...
      </div>
    );
  }

  // Сортировка массивов заказов покупателей
  const activeOrdersList = ordersQuery.data || [];
  const archivedOrdersList = archivedOrdersQuery.data || [];
  const displayedOrders = isOrderArchiveTab
    ? archivedOrdersList
    : activeOrdersList;
  const currentOrdersQuery = isOrderArchiveTab
    ? archivedOrdersQuery
    : ordersQuery;

  return (
    <div className="p-4 flex flex-col items-center w-full">
      <div
        className={
          showProducts
            ? "flex flex-col w-full max-w-6xl overflow-x-auto"
            : "hidden"
        }
      >
        {/* НАВИГАЦИОННЫЕ ВКЛАДКИ АДМИНКИ С ЖИВЫМИ СЧЕТЧИКАМИ */}
        <div className="flex gap-4 border-b mb-4 w-full min-w-[750px]">
          <button
            type="button"
            onClick={() => {
              setCurrentTab("stock");
              setSearchQuery("");
              setSelectedCategory("");
            }}
            className={`pb-2 px-4 font-semibold text-sm transition-all ${
              currentTab === "stock"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Активный склад ({activeQuery.data?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentTab("archive");
              setSearchQuery("");
              setSelectedCategory("");
            }}
            className={`pb-2 px-4 font-semibold text-sm transition-all ${
              currentTab === "archive"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Архив / Удаленные ({archiveQuery.data?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentTab("orders");
              setSearchQuery("");
              setSelectedCategory("");
            }}
            className={`pb-2 px-4 font-semibold text-sm transition-all ${
              currentTab === "orders"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Заказы клиентов ({ordersQuery.data?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentTab("order_archive");
              setSearchQuery("");
              setSelectedCategory("");
            }}
            className={`pb-2 px-4 font-semibold text-sm transition-all ${
              currentTab === "order_archive"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Архив заказов ({archivedOrdersQuery.data?.length || 0})
          </button>
        </div>

        {/* УСЛОВНЫЙ РЕНДЕРИНГ: РАЗДЕЛ ЗАКАЗОВ (АКТИВНЫХ ИЛИ АРХИВНЫХ) */}
        {isOrdersTab || isOrderArchiveTab ? (
          <div className="w-full space-y-4">
            {currentOrdersQuery.isLoading && (
              <div className="p-8 text-center">Загрузка журналов...</div>
            )}
            {!currentOrdersQuery.isLoading && displayedOrders.length === 0 && (
              <div className="p-8 text-center text-gray-400 bg-gray-50 border border-dashed rounded-lg">
                {isOrderArchiveTab
                  ? "Архив выполненных заказов пуст"
                  : "Новых заказов пока нет"}
              </div>
            )}

            {!currentOrdersQuery.isLoading &&
              displayedOrders.map((order) => {
                const orderTotal = order.orderProducts.reduce(
                  (sum, item) =>
                    sum + item.quantityInOrder * item.product.price,
                  0,
                );
                const rawEmail = order.user.email;
                const isGuest = rawEmail.endsWith("@guest.store");
                const displayPhone = isGuest
                  ? rawEmail.replace("@guest.store", "")
                  : order.user.phone || "Не указан";

                return (
                  <div
                    key={order.id}
                    className="w-full border border-gray-200 rounded-xl p-4 bg-white shadow-xs space-y-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg text-sm border">
                        <div>
                          <span className="font-bold text-gray-900">
                            Заказ #{order.id}
                          </span>
                          <span className="text-gray-400 mx-2">|</span>
                          <span className="text-gray-500 text-xs">
                            {new Date(order.createdAt).toLocaleString("ru-RU")}
                          </span>
                          {isOrderArchiveTab && (
                            <span className="ml-3 text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              Выполнен
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-indigo-600 text-base">
                          {orderTotal.toLocaleString("ru-RU")} ₽
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm px-2">
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-semibold text-gray-400 uppercase text-[10px] tracking-wider mb-1">
                              Данные клиента
                            </h4>
                            <div className="text-gray-900 font-medium">
                              {order.user.name}
                            </div>
                            <div className="text-indigo-600 font-semibold text-xs mt-1 bg-indigo-50 inline-block px-2 py-0.5 rounded border border-indigo-100">
                              📞 Тел: {displayPhone}
                            </div>
                            <div className="text-emerald-700 font-semibold text-xs bg-emerald-50 inline-block px-2 py-0.5 rounded border border-emerald-100 w-fit">
                              {/* Безопасное приведение к unknown, а затем к объекту с полем address */}
                              📍 Адрес:{" "}
                              {(order as unknown as { address?: string })
                                .address || "Не указан (Ошибка системы)"}
                            </div>
                            {!isGuest && (
                              <div className="text-gray-400 text-[11px] mt-1">
                                Email: {rawEmail}
                              </div>
                            )}
                          </div>

                          {/* Отображение комментария покупателя */}
                          <div className="pt-2 border-t border-gray-100">
                            <h4 className="font-semibold text-gray-400 uppercase text-[10px] tracking-wider mb-1">
                              Комментарий к заказу
                            </h4>
                            <div className="text-xs bg-amber-50 border border-amber-100 p-2 rounded-lg text-gray-700 italic max-w-sm">
                              {order.comment ||
                                "Покупатель не оставил комментарий"}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-400 uppercase text-[10px] tracking-wider mb-1">
                            Состав букетов
                          </h4>
                          <div className="space-y-1">
                            {order.orderProducts.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between text-xs border-b border-dashed pb-0.5"
                              >
                                <span className="text-gray-700">
                                  {item.product.title}
                                </span>
                                <span className="font-bold text-gray-900">
                                  {item.quantityInOrder} шт.
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Кнопка архивации активна только на вкладке необработанных заказов */}
                    {!isOrderArchiveTab && (
                      <div className="w-full md:w-auto flex justify-end pt-2 md:pt-0 border-t md:border-t-0 border-dashed">
                        <button
                          type="button"
                          disabled={archiveOrderMutation.isPending}
                          onClick={() => handleArchiveOrderClick(order.id)}
                          className="w-full md:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs whitespace-nowrap disabled:bg-emerald-300"
                        >
                          {archiveOrderMutation.isPending &&
                          archiveOrderMutation.variables === order.id
                            ? "Архивация..."
                            : "Выполнен / В архив"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          /* СТАНДАРТНЫЙ РЕНДЕРИНГ: СКЛАД И АРХИВ ТОВАРОВ БУКЕТОВ */
          <>
            {/* Блок фильтрации и контекстного живого поиска */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full max-w-2xl bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Поиск по названию
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Введите название букета..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
              <div className="w-full sm:w-56">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Фильтр категорий
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Все категории</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.category}>
                      {cat.category}
                    </option>
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

            {currentQuery.isLoading && (
              <div className="p-8 text-center text-gray-500">
                Загрузка данных...
              </div>
            )}

            {!currentQuery.isLoading && displayedProducts.length === 0 && (
              <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                Нет подходящих товаров
              </div>
            )}

            {/* Вывод строк продуктов */}
            {!currentQuery.isLoading &&
              displayedProducts.map((product) => (
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
                    product.orderProducts?.reduce(
                      (acc, order) => acc + order.quantityInOrder,
                      0,
                    ) || 0
                  }
                  isArchiveMode={isArchive}
                  onEdit={() => setEditingProduct(product)}
                  onDelete={() => handleDeleteClick(product.id, product.title)}
                  onRestore={() =>
                    handleRestoreClick(product.id, product.title)
                  }
                />
              ))}
          </>
        )}
      </div>

      <EditProductModal
        key={editingProduct ? editingProduct.id : "closed"}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
      />
    </div>
  );
}
