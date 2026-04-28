"use client"

import {useState} from "react";

export default function SubscribeForm () {
  const [email, setEmail] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // ОТМЕНЯЕТ перезагрузку и прыжок к якорю
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row mt-2  text-sm">
      <input 
        type="email"
        placeholder="Введите ваш e-mail"
        value={email}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
        className="text-center border border-[#758956] bg-transparent py-2 outline-none font-thin antialiased focus:border-[#758956] transition-colors w-full"
      />
      <button onClick={() => setEmail('')}
        type="submit" 
        className="whitespace-nowrap text-white px-6 py-2 bg-[#758956]"
      >
        Подписаться на рассылку
      </button>
    </form>
  )
}