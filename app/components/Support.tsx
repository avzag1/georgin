"use client"

import Image from "next/image";
import { useState, useEffect } from "react";
import { TextInput, Textarea, Label, Button, Checkbox } from "flowbite-react";
import { useStore } from '../store/useStore';

export default function Support () {
  const supportModal = useStore((state) => state.supportModal);
  const setSupportModal = useStore((state) => state.setSupportModal);

  useEffect(() => {
    if (supportModal !== 0) {
      // 1. Находим ширину скроллбара
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      // 2. Блокируем скролл и добавляем отступ
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      // 3. Возвращаем всё как было
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    // На всякий случай очищаем стили при размонтировании компонента
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [supportModal]);

  const getSupportClass = () => 
    `${supportModal === 1 ? 
      "flex items-center justify-center w-[600] h-[700] p-10 bg-white border fixed inset-y-[calc(50%-350px)] inset-x-[calc(50%-300px)]" 
      : "hidden"}`;
  const [email, setEmail] = useState("");
  const [name, setName] = useState('');
  const [problem, setProblem] = useState('');

  return (
    <div className={getSupportClass()}>
          
      <div className="space-y-6 relative">
        <button onClick={() => setSupportModal(0)} className="absolute right-3 top-3">
          <Image
          src = "/closeIcon.png"
          alt = "Крест"
          width = {15}
          height = {17}
          />
        </button>
        
        <div className="flex">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white ml-4 mt-2">
            Служба поддержки
          </h3>
        </div>

        <div>
          <div className="mb-2 block">
            <Label htmlFor="name">Ваше имя*</Label>
          </div>
          <TextInput
            className="[&_input]:p-1"
            id="name"
            placeholder="Ведите имя"
            value={name}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
            required
          />
        </div>
        
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email">e-mail для ответа*</Label>
          </div>
          <TextInput
            className="[&_input]:p-1"
            id="email"
            placeholder="ivanov@mail.ru"
            value={email}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <div className="mb-2 block">
            <Label htmlFor="problem">Текст обращения</Label>
          </div>
          <Textarea
            className="p-1"
            id="problem"
            placeholder="Введите вашу проблему"
            rows={8}
            value={problem}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setProblem(event.target.value)}
            required
          />
        </div>
        
        <div className="flex justify-between mt-10">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" className="scale-150"/>
            <Label htmlFor="remember">
              Я принимаю пользовательское соглашение и даю согласие на обработку 
              ИП Таммет Яан Эдуардович моих персональных данных на условиях, 
              определенных политикой конфиденциальности
            </Label>
          </div>
        </div>
        <Button onClick={() => setSupportModal(0)} className="w-[516] h-[45] bg-[#7E8F52] text-center">Отправить</Button>
      </div>
    </div>
  )
}