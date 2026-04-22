export default function OrderBouquetButton ({ bgColor }: { bgColor: string }) {
  return (
    <button className={`flex items-center justify-center w-[132] h-[49] text-xl ${bgColor}`}>
      Заказать
    </button>
  )
}