"use client"

export default function OrderButtonActive ({ bgColor, textColor }: { bgColor: string, textColor: string }) {
  return (
    <button
    onClick={(e) => {
      if (window.location.pathname === '/') {
        e.preventDefault();
        document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' });
      }
    }}
    className={`flex items-center justify-center w-[198] h-[60] text-base shadow-xl rounded-4xl lg:rounded-none cursor-pointer ${bgColor} ${textColor}
    transition-colors duration-200 hover:bg-[#9fac7a]
     active:bg-[#d7e6b2] active:text-[#242918]`}>
      Заказать букет
    </button>
  )
}