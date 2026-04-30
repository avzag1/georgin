"use client"

import Image from "next/image";
import {orderArray} from "../orderArray";
import { useState } from "react";
import ShoppingCardRow from "./ShoppingCardRow";
import { useStore } from '../store/useStore';

export default function ShoppingCardItems() {
  const shoppingCardModal = useStore((state) => state.shoppingCardModal);
  const setShoppingCardModal = useStore((state) => state.setShoppingCardModal);

  const currentCustomerOrder = orderArray.find(item => 
    item.customer === "client_1" && item.status === 'new'
  );

  if (!currentCustomerOrder) return <div>Корзина пуста</div>;

  return (
    <div className="w-full">
      {currentCustomerOrder.goods.map((item, index) => (
        <ShoppingCardRow key={index} item={item} />
      ))}
    </div>
  );
}