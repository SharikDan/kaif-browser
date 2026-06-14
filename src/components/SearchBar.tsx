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
      searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    }
    addTab(searchUrl, query);
    setQuery('');
    inputRef.current?.blur();
  };

  return (
    <div className="fixed top-12 left-0 right-0 z-20 bg-white shadow-md border-b border-gray-200">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Введите поисковый запрос или URL..."
              className="w-full bg-gray-100 border border-gray-300 rounded-full px-6 py-4 text-lg text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition"
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