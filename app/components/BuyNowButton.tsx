export default function OrderBouquet ({ bgColor }: { bgColor: string }) {
  return (
    <button className={`flex items-center justify-center w-[180] lg:w-[160] h-[49] text-xl text-white border border-white rounded-4xl lg:rounded-none ${bgColor}`}>
      Купить сейчас
    </button>
  )
}