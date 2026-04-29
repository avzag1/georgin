export default function OrderButtonActive ({ bgColor, textColor }: { bgColor: string, textColor: string }) {
  return (
    <button className={`flex items-center justify-center w-[198] h-[60] text-base shadow-xl rounded-4xl lg:rounded-none ${bgColor} ${textColor}`}>
      Заказать букет
    </button>
  )
}