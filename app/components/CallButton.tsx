import Link from "next/link"

export default function CallButton () {
  return (
    <Link target="blank" href="tel:+79379388777" className="flex items-center justify-center w-[132]
     h-[38] lg:h-[49] text-base border rounded-4xl lg:rounded-none z-20 hover:bg-[#e2d9e1] active:bg-[#f3d1ed] transition-colors duration-200">
      Позвонить
    </Link>
  )
}