export default function OrderButtonActive ({ bgColor }: { bgColor: string }) {
  return (
    <button className={`flex items-center justify-center w-[198] h-[60] text-base shadow-xl ${bgColor}`}>
      Заказать букет
    </button>
  )
}