"use client"

import {useState} from "react";

export default function SubscribeForm () {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setModalMessage(data.message || "Спасибо! Вы успешно подписались на рассылку.");
        setEmail(""); // Очищаем инпут строго при успешном ответе базы
      } else {
        setModalMessage(data.error || "Произошла ошибка. Попробуйте позже.");
      }
    } catch {
      setModalMessage("Не удалось связаться с сервером. Проверьте интернет-соединение.");
    } finally {
      setIsLoading(false);
      setShowModal(true); // Открываем модальное окно с результатом
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col items-center lg: sm:flex-row mt-2 text-xs lg:text-sm">
        <input
          type="email"
          placeholder={isLoading ? "Отправка..." : "Введите ваш e-mail"}
          value={email}
          disabled={isLoading}
          required
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
          className="text-center border border-[#758956] bg-transparent py-2 outline-none font-thin
         antialiased focus:border-[#758956] transition-colors w-[296] min-[260px]:max-[360px]:w-[200] lg:w-full sm:h-[40] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="whitespace-nowrap text-white px-6 lg:py-2 bg-[#758956] w-[296] min-[260px]:max-[360px]:w-[200] lg:w-[354]
         h-[25] sm:h-[40] my-3 lg:my-0 cursor-pointer transition-colors duration-200 hover:bg-[#616e40]
           active:bg-[#d7e6b2] active:text-[#242918] flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? "Обработка..." : "Подписаться на рассылку"}
        </button>
      </form>

      {/* ✅ КРАСИВОЕ МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ */}
      {showModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white p-6 lg:p-8 rounded-xl shadow-2xl max-w-sm w-full text-center border border-gray-100 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4">
              🌿
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Уведомление</h3>
            <p className="text-sm text-gray-600 mb-6 font-light">{modalMessage}</p>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 bg-[#758956] hover:bg-[#616e40] text-white font-medium text-sm rounded-lg transition-colors cursor-pointer focus:outline-none"
            >
              Отлично
            </button>
          </div>
        </div>
      )}
    </>
  );
}