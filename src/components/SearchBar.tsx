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
    if (query.includes('.') && !query.includes(' ')) {
      searchUrl = query.startsWith('http') ? query : `https://${query}`;
    } else {
      // Используем Яндекс (работает в РФ)
      searchUrl = `https://yandex.ru/search/?text=${encodeURIComponent(query)}`;
    }
    addTab(searchUrl, query);
    setQuery('');
    inputRef.current?.blur();
  };

  return (
    <div className="fixed top-14 left-0 right-0 z-20 bg-black/90 backdrop-blur-sm border-b border-cyan-500/30 shadow-lg">
      <div className="max-w-4xl mx-auto px-6 py-5">
        <form onSubmit={handleSubmit}>
          <div className="relative group">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск в Яндексе или введите URL..."
              className="w-full bg-gray-900 border-2 border-cyan-500 rounded-2xl px-8 py-5 text-xl text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all shadow-lg shadow-cyan-500/20"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2 rounded-full text-base font-semibold transition shadow-md"
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