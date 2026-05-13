import Image from "next/image";

export default function ProductRowAdmin({
  title,
  description,
  image,
  price,
  actionPrice,
  category,
  quantityInStore,
  inShoppingCards
}: {
  title: string;
  description: string;
  image: string;
  price: number;
  actionPrice: number;
  category: string;
  quantityInStore: number;
  inShoppingCards: number
}) {
  return (
    <div className="flex">
      <div className="w-30 text-center">{title}</div>
      <div className="w-40 text-center">{description}</div>
      <div className="w-20 text-center">{price}</div>
      <div className="w-20 text-center">{actionPrice}</div>
      <div className="w-30 text-center">{category}</div>
      <div className="w-20 text-center">{quantityInStore}</div>
      <div className="w-20 text-center">
        <Image
          src={image}
          alt="Изображение товара"
          width={30}
          height={30}
        />
        </div>
      <div className="w-20 text-center">{inShoppingCards}</div>
    </div>
  );
}
