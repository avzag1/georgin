export default function OrderBouquetButton ({ bgColor }: { bgColor: string }) {
  return (
    <button className={`flex items-center justify-center w-[155] lg:w-[132] h-[49] text-xl font-extralight antialiased text-white rounded-4xl lg:rounded-none ${bgColor}`}>
      Заказать
    </button>
  )
}