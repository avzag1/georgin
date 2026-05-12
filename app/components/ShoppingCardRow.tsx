"use client";

import { Product } from "../orderArray";
import Image from "next/image";
import { useStore } from "../store/useStore";
import { storeArray } from "../storeArray";

export default function ShoppingItem({ orderItem }: { orderItem: Product }) {
  const order = useStore((state) => state.order);
  const setOrder = useStore((state) => state.setOrder);

  const currentProductInStore = storeArray.find(
    (p) => p.title === orderItem.bouquet.title,
  );
  const actualQuantityInStore = currentProductInStore?.quantity || 0;
  const actualPrice =
    orderItem.bouquet.actionPrice || orderItem.bouquet.price || 0;

  const addCount = () => {
    if (!order) return;
    const updatedGoods = order.goods.map((product) => {
      if (product.bouquet.title === orderItem.bouquet.title) {
        const canAdd = orderItem.quantity < actualQuantityInStore;
        return {
          ...product,
          quantity: canAdd ? product.quantity + 1 : product.quantity,
        };
      }
      return product;
    });
    setOrder({ ...order, goods: updatedGoods });
  };
  const subtractCount = () => {
    if (!order) return;
    const updatedGoods = order.goods.map((product) => {
      if (product.bouquet.title === orderItem.bouquet.title) {
        const canSubtract = product.quantity > 1;
        return {
          ...product,
          quantity: canSubtract ? product.quantity - 1 : 1,
        };
      }
      return product;
    });
    setOrder({ ...order, goods: updatedGoods });
  };

  const itemPrice = orderItem.bouquet.actionPrice || orderItem.bouquet.price;

  return (
    <div className="w-full h-[100] min-[260px]:max-[370px]:h-auto flex border-b mb-3 min-[260px]:max-[370px]:flex-col">
      <div className="flex">
        <div className="mr-0 lg:mr-5 pl-0 lg:pl-2 min-w-[90]">
          <Image
            src={orderItem.bouquet.image}
            alt="Букет"
            width={82}
            height={84}
          />
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className="flex flex-col pb-3 pl-3 lg:pl-0 w-[145] lg:w-60">
            <div className="font-medium text-sm lg:text-base h-auto">
              {orderItem.bouquet.title}
            </div>
            <div className="text-xs lg:text-base h-auto">
              {orderItem.bouquet.description}
            </div>
          </div>

          <div className="flex justify-center items-center w-[56] lg:w-30 ml-8 lg:ml-0 scale-90 lg:scale-100">
            <button
              onClick={subtractCount}
              className="bg-[#B2B2B2] px-3 py-1 rounded-l-xl"
            >
              -
            </button>
            <div className="bg-[#eeeeee] py-1 min-w-[30] text-center w-[21]">
              {
                order?.goods.find(
                  (product) =>
                    product.bouquet.title === orderItem.bouquet.title,
                )?.quantity
              }
            </div>
            <button
              onClick={addCount}
              className="bg-[#B2B2B2] px-3 py-1 rounded-r-xl"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between min-[260px]:max-[370px]:mt-10">
        <div className="w-[75] hidden lg:block">
          <div className="text-xs text-center">Цена за шт</div>
          <div className="flex items-center font-bold justify-center mt-5.5">
            <p>{itemPrice.toLocaleString("ru-RU")}</p>
          </div>
        </div>

        <div className="flex flex-col min-[260px]:max-[370px]:flex-row items-center ml-3 font-bold w-[61] min-[260px]:max-[370px]:w-full">
          <div className="lg:hidden text-xs text-center font-normal">Цена</div>
          <div className="hidden lg:inline text-xs text-center font-normal">
            Всего
          </div>
          <div className="mt-5.5 min-[260px]:max-[370px]:m-auto">
            <p>{(orderItem.quantity * actualPrice).toLocaleString("ru-RU")}</p>
          </div>
        </div>

        <button
          onClick={() => {
            if (!order) return;
            const updatedGoods = order.goods.filter((g) => g !== orderItem);
            setOrder({ ...order, goods: updatedGoods });
          }}
          className="flex justify-center items-center ml-2"
        >
          <Image src="/deleteIcon.png" alt="Удалить" width={16} height={17} />
        </button>
      </div>
    </div>
  );
}
