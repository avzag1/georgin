"use client"

import Image from "next/image";
import { useState } from "react";
import { TextInput, Label, Button, Checkbox } from "flowbite-react";
import { useStore } from '../store/useStore';

export default function Profile () {
  const profileModal = useStore((state) => state.profileModal);
  const setProfileModal = useStore((state) => state.setProfileModal);
  const getProfileClass = () => 
    `${profileModal === 1 ? 
      "flex w-[600] h-[600] p-10 bg-white border absolute inset-y-1/2 inset-x-[calc(50%-300px)]" 
      : "hidden"}`;
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  return (
    <div className={getProfileClass()}>
          
      <div className="space-y-6 relative">
        <button onClick={() => setProfileModal(0)} className="absolute right-3 top-3">
          <Image
          src = "/closeIcon.png"
          alt = "Крест"
          width = {15}
          height = {17}
          />
        </button>
        
        <div className="flex">
          <div>
            <Image
              src = "/profile.png"
              alt = "Профиль"
              width = {44}
              height = {44}
            />
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white ml-4 mt-2">
            Профиль клиента
          </h3>
        </div>

        <div>
          <div className="mb-2 block">
            <Label htmlFor="name">Ваше имя</Label>
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
            <Label htmlFor="email">e-mail</Label>
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
            <Label htmlFor="phone">Номер телефона</Label>
          </div>
          <TextInput
            className="[&_input]:p-1"
            id="phone"
            placeholder="+7 ___ __ __"
            value={phone}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPhone(event.target.value)}
            required
          />
        </div>
        
        <div className="flex justify-between mt-25">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" className="scale-150"/>
            <Label htmlFor="remember">
              Я принимаю пользовательское соглашение и даю согласие на обработку 
              ИП Таммет Яан Эдуардович моих персональных данных на условиях, 
              определенных политикой конфиденциальности
            </Label>
          </div>
        </div>
        <Button onClick={() => setProfileModal(0)} className="w-[516] h-[45] bg-[#7E8F52] text-center">Отправить</Button>
      </div>
    </div>
  )
}