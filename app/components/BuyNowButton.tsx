export default function OrderBouquet ({ bgColor }: { bgColor: string }) {
  return (
    <button className={`flex items-center justify-center w-[160] h-[49] text-xl text-white border border-white ${bgColor}`}>
      Купить сейчас
    </button>
  )
}