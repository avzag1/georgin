import Image from "next/image";
import ShowcaseSlider from "./ShowcaseSlider";
import type {Bouquet} from "../type/bouquet"

interface ShowcaseProps {
  array: Bouquet[];
}

export default function Showcase ({ array }: ShowcaseProps) {
  return (
    <section id="showcase">
      <div className="w-full mx-auto mb-13">
        <div className="hidden lg:block my-15">
          <Image
            className="mx-auto w-17/20"
            src = "/showcaseTitle.png"
            alt = "Онлайн-витрина"
            width = {1240}
            height = {84}
          />
        </div>
        
        <ShowcaseSlider array={array}/>

      </div>
    </section>
  )
}