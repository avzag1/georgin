"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// 1. ОПИСЫВАЕМ СТРОГИЕ ИНТЕРФЕЙСЫ ДЛЯ ТИПИЗАЦИИ ДАННЫХ
interface PromoCodeAdminData {
  id: number;
  code: string;
  discount: number;
  type: string;
  expiresAt: string | null;
  products: { product: { title: string } }[];
  users: { user: { email: string } }[];
  _count: { usages: number };
}

interface ProductAdminListData {
  id: number;
  title: string;
}

interface NewPromoMutationVariables {
  code: string;
  discount: number;
  type: string;
  expiresAt: string | null;
  productIds: number[];
  userIds: number[];
}

export default function PromocodesBlockAdmin() {
  const queryClient = useQueryClient();
  
  // Состояние формы
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [type, setType] = useState("PERCENT"); // PERCENT или FIXED
  const [expiresAt, setExpiresAt] = useState("");
  const [targetType, setTargetType] = useState("all"); // all, products, users
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // Указан строгий тип PromoCodeAdminData[] вместо any[]
  const { data: promocodes = [], isLoading: isPromoLoading } = useQuery<PromoCodeAdminData[]>({
    queryKey: ["admin-promocodes"],
    queryFn: () => fetch("/api/admin/promocodes").then((res) => res.json()),
  });

  // ИСПРАВЛЕНО: Указан строгий тип ProductAdminListData[] вместо any[]
  const { data: products = [] } = useQuery<ProductAdminListData[]>({
    queryKey: ["products", "list"],
    queryFn: () => fetch("/api/products?archived=false").then((res) => res.json()),
  });

  // ИСПРАВЛЕНО: Мутация теперь строго знает типы входящих параметров
  const createMutation = useMutation<unknown, Error, NewPromoMutationVariables>({
    mutationFn: async (newPromo) => {
      const res = await fetch("/api/admin/promocodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPromo),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promocodes"] });
      setCode(""); setDiscount(""); setExpiresAt("");
      setSelectedProducts([]); setSelectedUsers([]);
      alert("Промокод успешно создан!");
    },
    onError: (err: Error) => alert(err.message),
  });

  // Мутация удаления
  const deleteMutation = useMutation<unknown, Error, number>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/promocodes?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Не удалось удалить");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-promocodes"] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discount) return;
    
    createMutation.mutate({
      code,
      discount: parseFloat(discount),
      type,
      expiresAt: expiresAt || null,
      productIds: targetType === "products" ? selectedProducts : [],
      userIds: targetType === "users" ? selectedUsers : [],
    });
  };

  const handleProductSelect = (id: number) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-6xl mx-auto my-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">🎫 Управление промокодами</h1>

      {/* ФОРМА СОЗДАНИЯ */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-5 rounded-lg border mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Промокод</label>
          <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="SPRING10" className="w-full border p-2 rounded font-mono uppercase text-sm" required />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Скидка</label>
          <div className="flex">
            <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="10" className="w-full border p-2 rounded-l text-sm font-mono" required />
            <select value={type} onChange={(e) => setType(e.target.value)} className="border-y border-r p-2 rounded-r bg-white text-sm font-bold">
              <option value="PERCENT">%</option>
              <option value="FIXED">₽</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Срок действия (до)</label>
          <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="w-full border p-2 rounded text-sm font-mono" />
        </div>

        <div className="md:col-span-3 border-t pt-3">
          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Область действия промокода</label>
          <div className="flex gap-4 mb-3 text-sm">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="target" checked={targetType === "all"} onChange={() => setTargetType("all")} /> Общий (на всё)
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="target" checked={targetType === "products"} onChange={() => setTargetType("products")} /> На определенные букеты
            </label>
          </div>

          {/* Выбор товаров */}
          {targetType === "products" && (
            <div className="border rounded bg-white p-3 max-h-40 overflow-y-auto text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* ИСПРАВЛЕНО: Тип аргумента prod изменен со значения any на ProductAdminListData */}
              {products.map((prod: ProductAdminListData) => (
                <label key={prod.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-50 rounded">
                  <input type="checkbox" checked={selectedProducts.includes(prod.id)} onChange={() => handleProductSelect(prod.id)} />
                  <span className="truncate">{prod.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-3 text-right">
          <button type="submit" disabled={createMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded shadow-sm cursor-pointer disabled:bg-gray-300">
            {createMutation.isPending ? "Создание..." : "Выпустить промокод"}
          </button>
        </div>
      </form>

      {/* ТАБЛИЦА СУЩЕСТВУЮЩИХ КОДОВ */}
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 bg-gray-100 p-3 text-xs font-bold text-gray-500 uppercase border-b text-center">
          <div>Код</div>
          <div>Скидка</div>
          <div>Тип / Ограничения</div>
          <div>Использовано</div>
          <div>Истекает</div>
          <div>Действие</div>
        </div>

        {isPromoLoading ? (
          <div className="p-6 text-center text-sm text-gray-400">Загрузка промокодов...</div>
        ) : promocodes.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">Активных промокодов пока нет</div>
        ) : (
          // ИСПРАВЛЕНО: Тип аргумента promo изменен со значения any на PromoCodeAdminData
          promocodes.map((promo: PromoCodeAdminData) => (
            <div key={promo.id} className="grid grid-cols-6 p-3 items-center text-sm text-gray-600 border-b hover:bg-gray-50/50 text-center font-mono">
              <div className="font-bold text-purple-700 tracking-wider text-base">{promo.code}</div>
              <div className="font-bold">{promo.discount} {promo.type === "PERCENT" ? "%" : "₽"}</div>
              <div className="text-xs font-sans text-left px-2">
                {promo.products.length > 0 ? (
                  <span className="text-amber-700 font-medium">🛒 Только на ({promo.products.length} шт.) товаров</span>
                ) : promo.users.length > 0 ? (
                  <span className="text-blue-700 font-medium">👤 Персональный</span>
                ) : (
                  <span className="text-emerald-700 font-medium">🌍 На весь каталог</span>
                )}
              </div>
              <div className="font-bold text-gray-900">{promo._count?.usages || 0} раз</div>
              <div className="text-xs">{promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString("ru-RU") : "Бессрочно"}</div>
              <div>
                <button onClick={() => { if(confirm("Удалить?")) deleteMutation.mutate(promo.id); }} className="text-rose-600 hover:bg-rose-50 px-2 py-1 rounded transition-colors text-xs font-sans font-medium cursor-pointer">
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
