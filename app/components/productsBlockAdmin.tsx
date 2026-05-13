"use client";

import { useEffect, useState } from "react";
import ProductRowAdmin from "@/app/components/ProductRowAdmin";

// Описываем тип данных, которые приходят из вашего API
interface ProductWithOrders {
  id: number;
  image: string;
  title: string;
  description: string;
  price: number;
  actionPrice: number;
  category: string;
  quantityInStore: number;
  orderProducts: { quantityInOrder: number }[];
}

export default function ProductsBlockAdmin() {
  const [showProducts, setShowProducts] = useState(false);

  const toggleShowProducts = () => {
    setShowProducts(!showProducts);
  };

  const [products, setProducts] = useState<ProductWithOrders[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) {
          throw new Error("Ошибка загрузки");
        }
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, []);

  if (loading)
    return <div className="p-4 text-center">Загрузка товаров...</div>;

  return (
    <div className="p-4 flex flex-col items-center">

        <button
          onClick={toggleShowProducts}
          className="w-50 border p-3 m-5 bg-amber-100"
        >
          {showProducts ? "Скрыть товары" : "Показать все товары"}
        </button>

      <div className={showProducts ? "flex flex-col" : "hidden"}>
        {/* Шапка таблицы */}
        <div className="grid grid-cols-8 gap-4 font-bold border-b pb-2 mb-2 text-sm">
          <div className="w-30 text-center">Товар</div>
          <div className="w-40 text-center">Описание</div>
          <div className="w-20 text-center">Цена</div>
          <div className="w-20 text-center">Цена по акции</div>
          <div className="w-30 text-center">Категория</div>
          <div className="w-20 text-center">Количество</div>
          <div className="w-20 text-center">Изображение</div>
          <div className="w-20 text-center">В корзинах</div>
        </div>

        {/* Список товаров */}
        {products.map((product) => (
          <ProductRowAdmin
            key={product.id}
            title={product.title}
            description={product.description}
            image={product.image}
            price={product.price}
            actionPrice={product.actionPrice}
            category={product.category}
            quantityInStore={product.quantityInStore}
            inShoppingCards={
              product.orderProducts?.reduce(
                (acc, order) => acc + order.quantityInOrder,
                0,
              ) || 0
            }
          />
        ))}
      </div>
    </div>
  );
}
