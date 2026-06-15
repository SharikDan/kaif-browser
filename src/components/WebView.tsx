import React, { useEffect, useRef } from 'react';
import { WebviewWindow } from '@tauri-apps/api/window';

interface WebViewProps {
  url: string;
  onTitleChange?: (title: string) => void;
}

export const WebView: React.FC<WebViewProps> = ({ url, onTitleChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!url || !containerRef.current) return;

    // Создаём iframe внутри контейнера (Tauri использует iframe для WebView)
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals allow-top-navigation');
    
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(iframe);

    // Отслеживаем изменение заголовка
    const checkTitle = setInterval(() => {
      try {
        if (iframe.contentDocument?.title) {
          onTitleChange?.(iframe.contentDocument.title);
        }
      } catch (e) {}
    }, 1000);

    return () => {
      clearInterval(checkTitle);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [url, onTitleChange]);

  if (!url) return null;

  return (
    <div className="fixed inset-0 top-10 left-0 right-0 bottom-0 z-10 bg-transparent">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};