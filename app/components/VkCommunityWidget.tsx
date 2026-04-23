'use client'; // Обязательно, так как работаем с window и скриптами

import Script from 'next/script';
import { useEffect } from 'react';

interface Window {
  VK?: {
    init: (params: { apiId: number; onlyWidgets: boolean }) => void;
    Widgets: {
      Group: (elementId: string, options: object, groupId: number) => void;
      // Можно добавить другие виджеты, если понадобятся:
      Comments?: (elementId: string, options: object, pageId: string) => void;
    };
  };
}

declare global {
  interface Window {
    VK?: {
      init: (params: { apiId: number; onlyWidgets: boolean }) => void;
      Widgets: {
        Group: (elementId: string, options: unknown, groupId: number) => void;
      };
    };
  }
}

export default function VkCommunityWidget() {
  const containerId = "vk_groups";
  const apiId = 1234567; // Замените на ВАШ_API_ID
  const groupId = 1;     // Замените на ID вашей группы

  const initWidget = () => {
    if (window.VK) {
      // Шаг 2: Инициализация Open API
      window.VK.init({
        apiId: apiId,
        onlyWidgets: true
      });

      // Шаг 3: Отрисовка виджета
      window.VK.Widgets.Group(containerId, {
        mode: 4, 
        wide: 1,
        width: "auto", 
        height: "700"
      }, groupId);
    }
  };
  useEffect(() => {
    if (window.VK) {
      initWidget();
    }
  }, []);

  return (
    <div>
      {/* Шаг 1: Подключение openapi.js */}
      <Script 
        src="https://vk.ru/js/api/openapi.js?169" 
        strategy="afterInteractive"
        onLoad={initWidget} // Запуск после загрузки скрипта
      />
      
      {/* Контейнер для виджета */}
      <div id={containerId}></div>
    </div>
  );
}