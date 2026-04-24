import Image from "next/image";
import OrderButtonActive from "../components/OrderButtonActive";
import HitsSlider from "../components/HitsSlider";
import BuyNowButton from "../components/BuyNowButton";
import { hitsSliderArray } from "../hitsSliderArray";
import CallButton from "../components/CallButton";
import ShowcaseSlider from "../components/ShowcaseSlider";
import VkCommunityWidget from '../components/VkCommunityWidget';
import Subscribe from "../components/Subscribe";
import Link from 'next/link';
import Profile from "../components/Profile";

export default function Home() {
  return (
    <div className="bg-[#F5F2ED]">
            

      <section className="w-full relative">
        <div className="text-center h-5 text-sm text-white bg-[#0F330F]">
          БЕСПЛАТНАЯ ДОСТАВКА ПО ГОРОДУ ОТ 3000 рублей
        </div>
        <div className="w-full h-auto">
          <Image
            className="w-full h-auto mt-[-13]"
            src = "/mainDesktop.png"
            alt = "Главное изображение"
            width = {1440}
            height = {936}
          />
        </div>
        <div className="absolute bottom-[15%] left-[15%] z-50 flex flex-col items-center">
          <div className="mb-20">
            <OrderButtonActive bgColor="bg-[#ABC270]" textColor="text-black"/>
          </div>
          <div className="text-white flex flex-col items-center">
            <div className="text-lg">Доставка по Йошкар-Оле, Медведево и Семеновке</div>
            <div className="text-base">Возможна доставка за пределы города - уточняйте по телефону</div>
          </div>
        </div>
      </section>

      <section className="w-9/10 h-[615] bg-white mx-auto mt-28 mb-16 flex flex-row">
        <div>
          <Image
          className=""
          src = "/aboutPicture.png"
          alt = "О нас"
          width = {606}
          height = {615}
        />
        </div>
        
        <div className="flex flex-col mx-auto w-[600] h-[460]">
          <div className="flex">
            <div className="my-10 ml-15">
              <Image
              className=""
              src = "/aboutTitle.png"
              alt = "О нас (текст)"
              width = {194}
              height = {66}
              />
            </div>
            <div className="my-10 mx-5">
              <Image
              className=""
              src = "/minFlower.png"
              alt = "Цветок иконка"
              width = {52}
              height = {52}
              />
            </div>
          </div>
          <div className="bg-[#758956] rounded-4xl p-10 text-white">
            Георгин- это сеть цветочных салонов в г. Йошкар-Оле,<br/>
            где каждый букет создается с душой.<br/>
            Мы находимся по адресам:<br/>
            Яна Крастыня 2В,<br/> 
            Мира 113а<br/>  
            Красноармейская улица 103 к1.<br/> 
            Рады видеть вас каждый день с 9:00 до 20:00.<br/><br/> 

            Наша команда уверена, что цветы — это язык эмоций, поэтому мы подходим к составлению<br/> букетов не как к работе, а как к искусству.     Мы любим своё дело и хотим, чтобы вы<br/> дарили радость легко и с удовольствием.<br/><br/> 

            Дарите эмоции с «ГЕОРГИН»!</div>
        </div>
      </section>

      <section className="flex flex-col items-center mx-auto w-9/10">
        <div className="p-10">
          <Image
              className=""
              src = "/choiceTitle.png"
              alt = "Почему нас выбирают"
              width = {762}
              height = {40}
            />
        </div>

        <div className="bg-white w-full p-15">
          <div className="flex justify-around mb-15">
            <div className="flex flex-col items-center">
              <div>
                <Image
                className=""
                src = "/esteticItemFlower.png"
                alt = "Картинка цветок"
                width = {104}
                height = {100}
                />
              </div>
              <div className="my-8">
                <Image
                className=""
                src = "/esteticItemTitle.png"
                alt = "Эстетика в деталях"
                width = {236}
                height = {48}
                />
              </div>
              <div className="text-center">
                Наши флористы собирают букеты не по<br/>
                шаблону, а под человека, повод и<br/>
                настроение, продумывая каждую деталь
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div>
                <Image
                className=""
                src = "/quolityItemFlower.png"
                alt = "Картинка цветок"
                width = {104}
                height = {100}
                />
              </div>
              <div className="my-8">
                <Image
                className=""
                src = "/quolityItemTitle.png"
                alt = "Качество цветов"
                width = {212}
                height = {48}
                />
              </div>
              <div className="text-center">
                Мы тщательно отбираем цветы и работаем<br/>
                только со свежими поставками, поэтому наши<br/>
                композиции долго сохраняют свою красоту и<br/>
                радуют получателя не один день
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div>
                <Image
                className=""
                src = "/delieveryItemFlower.png"
                alt = "Картинка цветок"
                width = {189}
                height = {100}
                />
              </div>
              <div className="my-8">
                <Image
                className=""
                src = "/delieveryItemTitle.png"
                alt = "Доставка с заботой"
                width = {250}
                height = {48}
                />
              </div>
              <div className="text-center">
                Мы тщательно отбираем цветы и работаем<br/>
                только со свежими поставками, поэтому наши<br/>
                композиции долго сохраняют свою красоту и<br/>
                радуют получателя не один день
              </div>
            </div>
          </div>

          <div className="flex pt-10">
            <div>
              <Image
                className=""
                src = "/ideaFlowerPicture.png"
                alt = "Цветок"
                width = {431}
                height = {756}
              />
            </div>

            <div className="flex flex-col ml-30">
              <div>
                <Image
                className=""
                src = "/ideaTitle.png"
                alt = "Идеальный подарок"
                width = {645}
                height = {132}
              />
              </div>

              <div className="max-w-[618] my-10">
                Мы сделали процесс заказа максимально простым. Вы делитесь идеей и поводом, а наши флористы создают композицию, которая скажет все без слов. 
                Всего несколько шагов – и букет уже радует своего получателя
              </div>

              <div>
                <Image
                className=""
                src = "/howToOrderBlock.png"
                alt = "Как заказать"
                width = {400}
                height = {368}
              />
              </div>

              <div className="my-10 mx-20">
                <OrderButtonActive bgColor="bg-[#7E8F52]" textColor="text-white"/>
              </div>

              <div>
                <Image
                className=""
                src = "/delieveryNote.png"
                alt = "Условия доставки"
                width = {540}
                height = {69}
              />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col mx-auto w-full pb-30">
        <div className="py-15 mx-25">
          <Image
            className=""
            src = "/springHitsTitle.png"
            alt = "Хиты весны"
            width = {460}
            height = {40}
          />
        </div>
        <HitsSlider array={[...hitsSliderArray, ...hitsSliderArray,...hitsSliderArray,...hitsSliderArray]} high="h-600" rows={1} loop={true}/>
      </section>

      <section className="flex flex-col mx-auto w-full">
        <div className="relative">
          <div>
            <Image
              className="mx-auto w-full"
              src = "/actionsPic.png"
              alt = "Объявления и акции"
              width = {1448}
              height = {615}
            />
          </div>
          <div className="absolute inset-x-[calc(50%-80px)] inset-y-4/5"><BuyNowButton bgColor="bg-[#758956]"/></div>
          <div className="w-120 h-30 text-white text-center absolute inset-x-[calc(50%-240px)] inset-y-6/10">
           {hitsSliderArray.filter(bouquet => bouquet.actionPrice !== undefined)[0].description}
          </div>
        </div>
      </section>

      <section>
        <div className="w-full mx-auto mb-10">
          <div className="my-15">
            <Image
              className="mx-auto w-17/20"
              src = "/showcaseTitle.png"
              alt = "Онлайн-витрина"
              width = {1240}
              height = {84}
            />
          </div>
            <ShowcaseSlider/>
        </div>
      </section>

      <section className="relative">
        <div>
          <Image
            className="mx-auto w-full"
            src = "/callUsPic.png"
            alt = "Позвоните нам"
            width = {1440}
            height = {455}
            />
        </div>
        <div className="absolute inset-x-[calc(50%-61px)] inset-y-3/5 z-50">
          <CallButton/>
        </div>
      </section>

      <section className="w-9/10 mx-auto p-20 bg-white">
        <div className="flex justify-between">
          <div className="mb-10 ml-5">
          <Image
            className=""
            src = "/VKTitle.png"
            alt = "Мы Вконтакте"
            width = {505}
            height = {57}
            />
          </div>
          <div className="mr-20">
            <Subscribe/>
          </div>
        </div>
        
        <VkCommunityWidget/>
      </section>

      <footer className="w-[1440] h-[374] mx-auto bg-[#F5F2ED] flex flex-col justify-between p-10">
        <div className="flex flex-row justify-around">
          <div className="h-[140] flex flex-col text-[#394128] text-sm">
            <div className="font-semibold text-black p-2">О нас</div>
            <div className="p-2">Контакты</div>
            <div className="p-2">Отзывы</div>
            <div className="p-2">Поддержка</div>
          </div>

          <div className="h-[140] flex flex-col justify-between text-[#394128] text-sm">
            <div className="font-semibold text-black p-2">О Покупателям</div>
            <div className="p-2">Как заказать</div>
            <div className="p-2">Акции</div>
            <div className="p-2">Доставка</div>
          </div>

          <div className="h-[140] flex flex-col justify-between text-[#394128] text-sm">
            <div className="font-semibold text-black p-2">Каталог</div>
            <div  className="p-2">Хиты сезона</div>
            <div className="p-2">Авторские букеты</div>
            <div className="p-2">Моно букеты</div>
            <div className="p-2">Свадебные</div>
            <div className="p-2">Подарки</div>
          </div>

          <div className="flex flex-col">
            <div className="h-[140] flex flex-col justify-between text-[#394128] text-sm">
              <div className="font-semibold text-black">Контакты</div>
              <div className="">+7 (937) 938-87-77</div>
              <div>г. Йошкар-Ола</div>
              <div>Я. Крастыня 2В, Мира 113А,</div>
              <div>Красноармейская улица 103 к1</div>
            </div>

            <div className="mt-7 h-[50] flex flex-col justify-between text-[#394128] text-sm">
              <div className="font-semibold text-black">Режим работы</div>
              <div className="">ПН-ВС, с 9:00 до 20:00</div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <Image
              className="ml-5"
              src = "/logoFooter.png"
              alt = "Логотип"
              width = {219}
              height = {72}
            />
            
            <div className="flex justify-center mt-3">
              <a href="https://t.me/georgin1226">
                <Image
                  className="m-2"
                  src = "/telegramIcon.png"
                  alt = "Телеграм"
                  width = {25}
                  height = {26}
                />
              </a>
              <a href="https://www.instagram.com/georg.in12?igsh=ZGlybnhvd3BnMDFq&utm_source=qr">
                <Image
                  className="m-2"
                  src = "/instagramIcon.png"
                  alt = "Инстаграм"
                  width = {26}
                  height = {25}
                />
              </a>
              <a href="https://vk.com/georgin_yo">
                <Image
                  className="m-2"
                  src = "/VKIcon.png"
                  alt = "Вконтакте"
                  width = {25}
                  height = {25}
                />
              </a>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-7 w-full">
          <div className="flex items-end ml-15 text-xs">&copy; 2026 Copiright</div>
          <div className="flex flex-col w-[620]">
            <div className="font-medium">Узнайте первыми о самых выгодных акциях и предложениях</div>
            <form className="flex flex-col sm:flex-row mt-2  text-sm">
              <input 
                type="email"
                placeholder="Введите ваш e-mail" 
                className="text-center border border-[#758956] bg-transparent py-2 outline-none font-thin antialiased focus:border-[#758956] transition-colors w-full"
              />
              <button 
                type="submit" 
                className="whitespace-nowrap text-white px-6 py-2 bg-[#758956]"
              >
                Подписаться на рассылку
              </button>
            </form>
          </div>
        </div>
      </footer>

    </div>
  );
}
