"use client"

import {useState} from "react";

export default function SubscribeForm () {
  const [email, setEmail] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // ОТМЕНЯЕТ перезагрузку и прыжок к якорю
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center lg: sm:flex-row mt-2 text-xs lg:text-sm">
      <input 
        type="email"
        placeholder="Введите ваш e-mail"
        value={email}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
        className="text-center border border-[#758956] bg-transparent py-2 outline-none font-thin antialiased focus:border-[#758956] transition-colors w-[296] lg:w-full lg:h-[40]"
      />
      <button onClick={() => setEmail('')}
        type="submit" 
        className="whitespace-nowrap text-white px-6 lg:py-2 bg-[#758956] w-[296] lg:w-[354] h-[25] lg:h-[40] my-3 lg:my-0"
      >
        Подписаться на рассылку
      </button>
    </form>
  )
}