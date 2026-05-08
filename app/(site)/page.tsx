import Image from "next/image";
import OrderButtonActive from "../components/OrderButtonActive";
import HitsSlider from "../components/HitsSlider";
import BuyNowButton from "../components/BuyNowButton";
import { storeArray } from "../storeArray";
import CallButton from "../components/CallButton";
import VkCommunityWidget from "../components/VkCommunityWidget";
import SubscribeButton from "../components/SubscribeButton";
import Footer from "../components/Footer";
import Header from "../components/Header";
import MainScreen from "../components/MainScreen";
import AboutText from "../components/AboutText";
import Showcase from "../components/Showcase";

export default function Home() {
  return (
    <div className="bg-[#F5F2ED]">
      <Header />
      <MainScreen />

      <section
        id="about"
        className="w-full lg:w-9/10 h-auto sm:h-[550] lg:h-[615] bg-white mx-auto mt-0 lg:mt-28 mb-0 lg:mb-16 flex flex-row"
      >
        <div className="hidden md:flex">
          <Image
            className="w-full h-auto object-contain"
            src="/aboutPicture.png"
            alt="О нас"
            width={606}
            height={615}
          />
        </div>
        <div className="block sm:hidden w-full relative">
          <Image
            className="w-full h-auto"
            src="/aboutPic_Mobile.png"
            alt="О нас"
            width={399}
            height={555}
          />
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 min-w-4/7 text-white text-[11px]">
            <AboutText />
          </div>
        </div>

        <div className="hidden sm:flex flex-col mx-auto w-[600] h-[460]">
          <div className="flex justify-center">
            <div className="my-10 ml-15">
              <Image
                className=""
                src="/aboutTitle.png"
                alt="О нас (текст)"
                width={194}
                height={66}
              />
            </div>
            <div className="my-10 mx-5">
              <Image
                className=""
                src="/minFlower.png"
                alt="Цветок иконка"
                width={52}
                height={52}
              />
            </div>
          </div>
          <div className="bg-[#758956] rounded-4xl p-10 text-white mx-10
           min-w-[512] xl:max-h-[463] sm:max-h-[368]">
            <AboutText />
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center mx-auto w-9/10 relative">
        <div className="hidden lg:block p-10">
          <Image
            className=""
            src="/choiceTitle.png"
            alt="Почему нас выбирают"
            width={762}
            height={40}
          />
        </div>
        <div className="block lg:hidden p-5 lg:p-10">
          <Image
            className=""
            src="/choiceTitleMobile.png"
            alt="Почему нас выбирают"
            width={220}
            height={74}
          />
        </div>

        <div className="lg:bg-white w-full lg:p-15 overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-around mb-15">
            <div className="flex flex-row-reverse lg:flex-col lg:items-center lg:max-w-5/16">
              <div className="flex flex-col min-w-[110]">
                <Image
                  className="w-[63] lg:w-[104]"
                  src="/esteticItemFlower.png"
                  alt="Картинка цветок"
                  width={104}
                  height={100}
                />
              </div>
              <div className="flex flex-col items-center">
                <div className="my-2 ml-2 lg:my-8 self-start lg:self-center text-lg">
                  <div>ЭСТЕТИКА В ДЕТАЛЯХ</div>
                  {/* <Image
                    className=""
                    src="/esteticItemTitle.png"
                    alt="Эстетика в деталях"
                    width={236}
                    height={48}
                  /> */}
                </div>
                <div className="text-left lg:text-center text-sm lg:text-base mx-2 lg:mx-0">
                  Наши флористы собирают букеты не по шаблону, а под человека,
                  повод и настроение, продумывая каждую деталь
                </div>
              </div>
            </div>

            <div className="flex flex-row-reverse lg:flex-col lg:items-center lg:max-w-5/16 my-5 lg:my-0">
              <div className="flex flex-col min-w-[110]">
                <Image
                  className="w-[63] lg:w-[104]"
                  src="/quolityItemFlower.png"
                  alt="Картинка цветок"
                  width={104}
                  height={100}
                />
              </div>
              <div className="flex flex-col items-center">
                <div className="my-2 ml-2 lg:my-8 self-start lg:self-center text-lg">
                  <div>КАЧЕСТВО ЦВЕТОВ</div>
                </div>
                <div className="text-left lg:text-center text-sm lg:text-base mx-2 lg:mx-0">
                  Мы тщательно отбираем цветы и работаем только со свежими
                  поставками, поэтому наши композиции долго сохраняют свою
                  красоту и радуют получателя не один день
                </div>
              </div>
            </div>

            <div className="flex flex-row-reverse lg:flex-col lg:items-center lg:max-w-5/16">
              <div className="hidden lg:flex flex-col min-w-[110]">
                <Image
                  className="w-[125] lg:w-[189]"
                  src="/delieveryItemFlower.png"
                  alt="Картинка цветок"
                  width={189}
                  height={100}
                />
              </div>
              <div className="lg:hidden flex flex-col min-w-[110]">
                <Image
                  className="w-[125] lg:w-[189]"
                  src="/delieveryItemFlower_Mobile.png"
                  alt="Картинка цветок"
                  width={189}
                  height={100}
                />
              </div>

              <div className="flex flex-col items-center w-full">
                <div className="my-2 ml-2 lg:my-8 self-start lg:self-center text-lg">
                  <div>ДОСТАВКА С ЗАБОТОЙ</div>
                </div>
                <div className="self-start text-left lg:text-center text-sm lg:text-base mx-2 lg:mx-0">
                  Мы доставляем цветы аккуратно и вовремя, чтобы они радовали
                  получателя с первой секунды
                </div>
              </div>
            </div>
          </div>

          <div id="howToOrder" className="flex pt-0 lg:pt-10 relative">
            <div className="hidden sm:block">
              <Image
                className=""
                src="/ideaFlowerPicture.png"
                alt="Цветок"
                width={431}
                height={756}
              />
            </div>

            <div className="flex flex-col lg:ml-30 relative lg:w-3/5">
              <div className="w-[337] lg:w-[645] bg-[#a9b983] lg:bg-white py-9 lg:py-0 px-5 lg:px-0 rounded-t-3xl lg:rounded-t-none rounded-br-3xl lg:rounded-b-none">
                <Image
                  className=""
                  src="/ideaTitle.png"
                  alt="От идеи от идеального букета"
                  width={645}
                  height={132}
                />
              </div>

              <div className="max-w-[618] lg:my-10 my-2 text-xs lg:text-base pb-4 lg:pb-0">
                Мы сделали процесс заказа максимально простым. Вы делитесь идеей
                и поводом, а наши флористы создают композицию, которая скажет
                все без слов. Всего несколько шагов – и букет уже радует своего
                получателя
              </div>

              <div className="w-[250] lg:w-[400]">
                <Image
                  className=""
                  src="/howToOrderBlock.png"
                  alt="Как заказать"
                  width={400}
                  height={368}
                />
              </div>

              <div className="my-5 lg:my-10 mx-20">
                <OrderButtonActive
                  bgColor="bg-[#7E8F52]"
                  textColor="text-white"
                />
              </div>

              <div>
                <Image
                  className=""
                  src="/delieveryNote.png"
                  alt="Условия доставки"
                  width={540}
                  height={69}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end lg:hidden w-[160] lg:w-[400] absolute bottom-0 right-[-20] z-40">
          <Image
            className=""
            src="/howToOrderFlower.png"
            alt="Букет"
            width={225}
            height={343}
          />
        </div>
      </section>

      <section
        id="hits"
        className="flex flex-col mx-auto w-full pb-10 lg:pb-30 overflow-hidden"
      >
        <div className="w-[250] lg:w-[460] py-0 lg:py-15 mx-12 lg:mx-25 mt-10 lg:mt-0">
          <Image
            className=""
            src="/springHitsTitle.png"
            alt="Хиты весны"
            width={460}
            height={40}
          />
        </div>
        <HitsSlider
          array={[
            ...storeArray,
            ...storeArray,
            ...storeArray,
            ...storeArray,
          ]}
          high="h-600"
          rows={1}
          loop={true}
        />
      </section>

      <section
        id="actions"
        className="flex flex-col mx-auto w-full overflow-hidden"
      >
        <div className="relative">
          <div className="hidden lg:block">
            <Image
              className="mx-auto w-full"
              src="/actionsPic.png"
              alt="Объявления и акции"
              width={1448}
              height={615}
            />
          </div>
          <div className="block lg:hidden">
            <Image
              className="mx-auto w-full"
              src="/actionsPicMobile.png"
              alt="Объявления и акции"
              width={1448}
              height={615}
            />
          </div>
          <div className="absolute inset-x-[calc(50%-80px)] inset-y-4/5">
            <BuyNowButton bgColor="bg-[#758956]" />
          </div>
          <div className="w-120 h-30 text-white text-center absolute inset-x-[calc(50%-240px)] inset-y-6/10">
            {
              storeArray.filter(
                (bouquet) => bouquet.actionPrice !== undefined,
              )[0].description
            }
          </div>
        </div>
      </section>

      <Showcase />

      <section className="relative overflow-hidden">
        <div className="hidden lg:block">
          <Image
            className="mx-auto w-full"
            src="/callUsPic.png"
            alt="Позвоните нам"
            width={1440}
            height={455}
          />
        </div>
        <div className="block lg:hidden max-w-screen">
          <Image
            className="mx-auto w-full"
            src="/callUsPicMobile.png"
            alt="Позвоните нам"
            width={392}
            height={355}
          />
        </div>
        <div className="absolute inset-x-[calc(50%-61px)] inset-y-9/20 lg:inset-y-3/5 z-50">
          <CallButton />
        </div>
      </section>

      <section className="w-full lg:w-9/10 mx-auto p-8 lg:p-20 bg-white overflow-hidden">
        <div className="flex justify-between">
          <div className="mb-5 lg:mb-10 ml-0 lg:ml-5 w-[181] lg:w-[505] h-[20] lg:h-[57]">
            <Image
              className=""
              src="/VKTitle.png"
              alt="Мы Вконтакте"
              width={505}
              height={57}
            />
          </div>
          <div className="mr-0 lg:mr-20">
            <SubscribeButton />
          </div>
        </div>

        <VkCommunityWidget />
      </section>

      <Footer />
    </div>
  );
}
