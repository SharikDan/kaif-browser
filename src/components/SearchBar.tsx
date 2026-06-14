import React, { useState, useRef } from 'react';
import { useTabs } from '../contexts/TabsContext';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { addTab } = useTabs();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    let searchUrl: string;
    // Если введено похоже на URL (содержит точку и нет пробелов) и начинается с http или содержит домен
    if (query.includes('.') && !query.includes(' ')) {
      searchUrl = query.startsWith('http') ? query : `https://${query}`;
    } else {
      // По умолчанию используем Google (можно заменить на Яндекс)
      searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      // Если нужен Яндекс, раскомментируйте следующую строку и закомментируйте Google:
      // searchUrl = `https://yandex.ru/search/?text=${encodeURIComponent(query)}`;
    }
    addTab(searchUrl, query);
    setQuery('');
    inputRef.current?.blur();
  };

  return (
    <div className="fixed top-12 left-0 right-0 z-20 bg-gray-900 shadow-lg border-b border-cyan-500">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск в Google или введите адрес..."
              className="w-full bg-gray-800 border border-cyan-500 rounded-full px-6 py-4 text-lg text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-full text-sm font-medium transition"
            >
              Найти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;