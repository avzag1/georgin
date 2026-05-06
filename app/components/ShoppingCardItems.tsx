"use client";

import { Order, orderArray } from "../orderArray";
import { storeArray } from "../storeArray";
import ShoppingCardRow from "./ShoppingCardRow";
import { useStore } from "../store/useStore";
import { useEffect } from "react";

export default function ShoppingCardItems() {
  const order = useStore((state) => state.order);
  const setOrder = useStore((state) => state.setOrder);

  useEffect(() => {
    const currentCustomerOrder = orderArray.find(
      (item) => item.customer === "client_1" && item.status === "new",
    );

    if (currentCustomerOrder) {
      setOrder(currentCustomerOrder);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentCustomerOrder = orderArray.find(
        (item) => item.customer === "client_1" && item.status === "new",
      );

      if (currentCustomerOrder && order) {
        let isChanged: boolean = false;
        const orderTitles = currentCustomerOrder.goods.map(
          (product) => product.bouquet.title,
        );
        const storedOrderGoods = storeArray.filter((product) =>
          orderTitles.includes(product.title),
        );
        currentCustomerOrder.goods.map((item) => {
          const storedProduct = storedOrderGoods.find(
            (product) => product.title === item.bouquet.title,
          );
          if (
            storedProduct &&
            item.storedOrderQuantity > storedProduct.quantity
          ) {
            item.storedOrderQuantity = storedProduct.quantity;
            isChanged = true;
          }
        });
        if (isChanged) {
          setOrder(currentCustomerOrder);
        }
      }
    }, 5000);
    return () => clearInterval(interval); // Очистка при закрытии
  }, [order, setOrder]);

  if (!order || order.goods.length === 0) {
    return <div className="p-4 text-center">Корзина пуста</div>;
  }

  return (
    <div className="w-full">
      {order &&
        order.goods.map(
          (item) =>
            item.quantity > 0 && (
              <ShoppingCardRow key={item.bouquet.title} item={item} />
            ),
        )}
    </div>
  );
}
